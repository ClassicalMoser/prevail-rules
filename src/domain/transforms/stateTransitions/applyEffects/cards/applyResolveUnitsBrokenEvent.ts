import type { Board } from '@entities';
import type { ResolveUnitsBrokenEvent } from '@events';
import type { CleanupPhaseState, GameStateWithBoard, RoutState } from '@game';

import {
  getCleanupPhaseState,
  getNextStepForResolveRally,
  getPlayerUnitsWithPlacementOnBoard,
  getRallyResolutionStateAwaitingUnitsBroken,
  updateRallyResolutionStateForCurrentStep,
} from '@queries';
import {
  addUnitToRouted,
  removeUnitFromBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveUnitsBrokenEvent to the game state.
 * Routes all unit instances of the broken types (removes from board, adds to routed).
 * Updates the rally resolution state and advances to next step.
 * Uses {@link getRallyResolutionStateAwaitingUnitsBroken} for sequencing invariants.
 *
 * @param event - The resolve units broken event to apply
 * @param state - The current game state
 * @returns A new game state with units routed
 */
export function applyResolveUnitsBrokenEvent<TBoard extends Board>(
  event: ResolveUnitsBrokenEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const { player, unitTypes } = event;
  const phaseState = getCleanupPhaseState(state);

  const rallyState = getRallyResolutionStateAwaitingUnitsBroken(state, player);
  const defaultNextStep = getNextStepForResolveRally(state);

  // Find all unit instances of the broken types on the board
  const brokenTypeIds = new Set(unitTypes.map((type) => type.id));
  const playerUnits = getPlayerUnitsWithPlacementOnBoard(state, player);
  const unitsToRout = [...playerUnits].filter((unitWithPlacement) =>
    brokenTypeIds.has(unitWithPlacement.unit.unitType.id),
  );

  // Rout all broken unit instances
  let newState = state;
  for (const unitWithPlacement of unitsToRout) {
    const newBoardState = removeUnitFromBoard(
      newState.boardState,
      unitWithPlacement,
    );
    newState = updateBoardState(newState, newBoardState);
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
          completed: false,
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
  const finalNextStep: CleanupPhaseState['step'] =
    totalPenalty > 0
      ? phaseState.step // Stay on resolveRally step for discard penalty
      : defaultNextStep;

  // Update phase state with new rally resolution state
  const newPhaseState = updateRallyResolutionStateForCurrentStep(
    phaseState,
    updatedRallyState,
    finalNextStep,
  );

  return updatePhaseState(newState, newPhaseState);
}
