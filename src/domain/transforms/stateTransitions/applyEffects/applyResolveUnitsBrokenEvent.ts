import type {
  Board,
  CleanupPhaseState,
  GameState,
  RoutState,
  UnitWithPlacement,
} from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';

import { hasSingleUnit } from '@entities';
import { getBoardCoordinates, getBoardSpace, getOtherPlayer } from '@queries';
import {
  addUnitToRouted,
  removeUnitFromBoard,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveUnitsBrokenEvent to the game state.
 * Routes all unit instances of the broken types (removes from board, adds to routed).
 * Updates the rally resolution state and advances to next step.
 *
 * @param event - The resolve units broken event to apply
 * @param state - The current game state
 * @returns A new game state with units routed
 */
export function applyResolveUnitsBrokenEvent<TBoard extends Board>(
  event: ResolveUnitsBrokenEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { player, unitTypes } = event;
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }

  if (currentPhaseState.phase !== 'cleanup') {
    throw new Error('Current phase is not cleanup');
  }

  // Determine which rally resolution we're in
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);
  let rallyState;
  let isFirstPlayer: boolean;

  if (currentPhaseState.step === 'firstPlayerResolveRally') {
    if (player !== firstPlayer) {
      throw new Error(
        `Expected ${firstPlayer} (first player) for unit support`,
      );
    }
    rallyState = currentPhaseState.firstPlayerRallyResolutionState;
    isFirstPlayer = true;
  } else if (currentPhaseState.step === 'secondPlayerResolveRally') {
    if (player !== secondPlayer) {
      throw new Error(
        `Expected ${secondPlayer} (second player) for unit support`,
      );
    }
    rallyState = currentPhaseState.secondPlayerRallyResolutionState;
    isFirstPlayer = false;
  } else {
    throw new Error(
      `Cleanup phase is not on a resolveRally step: ${currentPhaseState.step}`,
    );
  }

  if (!rallyState) {
    throw new Error('Rally resolution state not found');
  }

  if (!rallyState.rallyResolved) {
    throw new Error('Rally has not been resolved yet');
  }

  if (rallyState.unitsLostSupport !== undefined) {
    throw new Error('Units lost support already resolved');
  }

  // Find all unit instances of the broken types on the board
  const brokenTypeIds = new Set(unitTypes.map((type) => type.id));
  const coordinates = getBoardCoordinates(state.boardState);
  const unitsToRout: UnitWithPlacement<TBoard>[] = [];

  for (const coordinate of coordinates) {
    const space = getBoardSpace(state.boardState, coordinate);

    if (hasSingleUnit(space.unitPresence)) {
      const unit = space.unitPresence.unit;
      if (unit.playerSide === player && brokenTypeIds.has(unit.unitType.id)) {
        unitsToRout.push({
          unit,
          placement: {
            coordinate,
            facing: space.unitPresence.facing,
          },
        });
      }
    }
    // TODO: Handle engaged units if needed
  }

  // Route all broken unit instances
  let newState = state;
  for (const unitWithPlacement of unitsToRout) {
    const newBoardState = removeUnitFromBoard(
      newState.boardState,
      unitWithPlacement,
    );
    newState = {
      ...newState,
      boardState: newBoardState,
    };
    newState = addUnitToRouted(newState, unitWithPlacement.unit);
  }

  // Calculate total rout penalty
  const totalPenalty = unitsToRout.reduce(
    (sum, unitWithPlacement) =>
      sum + unitWithPlacement.unit.unitType.routPenalty,
    0,
  );

  // Initialize rout discard state if penalty exists
  const routState: RoutState | undefined =
    totalPenalty > 0
      ? ({
          substepType: 'rout' as const,
          player,
          unitsToRout: new Set(unitsToRout.map((u) => u.unit)),
          numberToDiscard: totalPenalty,
          cardsChosen: false,
          cardsDiscarded: false,
        } satisfies RoutState)
      : undefined;

  // Update rally resolution state with the instances that were routed
  const updatedRallyState = {
    ...rallyState,
    unitsLostSupport: new Set(unitsToRout.map((u) => u.unit)),
    routState,
  };

  // Next step: stay on same step if penalty, otherwise advance
  // The orchestrator will check routDiscardState to determine next action
  const nextStep: CleanupPhaseState['step'] =
    totalPenalty > 0
      ? currentPhaseState.step // Stay on resolveRally step for discard penalty
      : isFirstPlayer
        ? 'secondPlayerChooseRally'
        : 'complete';

  const newPhaseState: CleanupPhaseState = isFirstPlayer
    ? {
        ...currentPhaseState,
        firstPlayerRallyResolutionState: updatedRallyState,
        step: nextStep,
      }
    : {
        ...currentPhaseState,
        secondPlayerRallyResolutionState: updatedRallyState,
        step: nextStep,
      };

  return {
    ...newState,
    currentRoundState: {
      ...newState.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
