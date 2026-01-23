import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MeleeResolutionState,
  RangedAttackResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import type { ResolveReverseEvent } from '@events';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getIssueCommandsPhaseState,
  getMeleeResolutionState,
  getRangedAttackResolutionState,
  getResolveMeleePhaseState,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveReverseEvent to the game state.
 * Updates the unit's facing to the opposite direction and marks the reverse state as completed.
 *
 * @param event - The resolve reverse event to apply
 * @param state - The current game state
 * @returns A new game state with the unit's facing updated and reverse state marked as completed
 */
export function applyResolveReverseEvent<TBoard extends Board>(
  event: ResolveReverseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Update the unit's facing on the board
  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    event.unitInstance,
  );
  const addedUnitBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    event.newUnitPlacement,
  );

  // Handle ranged attack resolution (in issueCommands phase)
  if (phaseState.phase === 'issueCommands') {
    const issueCommandsPhaseState = getIssueCommandsPhaseState(state);
    const rangedAttackState = getRangedAttackResolutionState(state);
    const attackApplyState = getAttackApplyStateFromRangedAttack(state);

    if (!attackApplyState.reverseState) {
      throw new Error('No reverse state found in ranged attack');
    }

    // Mark reverse as completed and set final position
    const newReverseState = {
      ...attackApplyState.reverseState,
      finalPosition: event.newUnitPlacement.placement,
      completed: true,
    };

    // Update attack apply state
    const newAttackApplyState = {
      ...attackApplyState,
      reverseState: newReverseState,
    };

    // Update ranged attack resolution state
    const newRangedAttackState: RangedAttackResolutionState<TBoard> = {
      ...rangedAttackState,
      attackApplyState: newAttackApplyState,
    };

    // Update phase state
    const newPhaseState: IssueCommandsPhaseState<TBoard> = {
      ...issueCommandsPhaseState,
      currentCommandResolutionState: newRangedAttackState,
    };

    return {
      ...state,
      boardState: addedUnitBoard,
      currentRoundState: {
        ...state.currentRoundState,
        currentPhaseState: newPhaseState,
      },
    };
  }

  // Handle melee resolution (in resolveMelee phase)
  if (phaseState.phase === 'resolveMelee') {
    const resolveMeleePhaseState = getResolveMeleePhaseState(state);
    const meleeState = getMeleeResolutionState(state);
    const firstPlayer = state.currentInitiative;

    // Determine which player's reverse state this is
    const reversingPlayer = event.unitInstance.unit.playerSide;
    const isFirstPlayerReverse = reversingPlayer === firstPlayer;

    let newMeleeState: MeleeResolutionState<TBoard>;
    if (isFirstPlayerReverse) {
      const attackApplyState = getAttackApplyStateFromMelee(state, firstPlayer);
      if (!attackApplyState.reverseState) {
        throw new Error('No reverse state found for first player');
      }

      const newReverseState = {
        ...attackApplyState.reverseState,
        finalPosition: event.newUnitPlacement.placement,
        completed: true,
      };

      const newAttackApplyState = {
        ...attackApplyState,
        reverseState: newReverseState,
      };

      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { whiteAttackApplyState: newAttackApplyState }
          : { blackAttackApplyState: newAttackApplyState }),
      };
    } else {
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      const attackApplyState = getAttackApplyStateFromMelee(
        state,
        secondPlayer,
      );
      if (!attackApplyState.reverseState) {
        throw new Error('No reverse state found for second player');
      }

      const newReverseState = {
        ...attackApplyState.reverseState,
        finalPosition: event.newUnitPlacement.placement,
        completed: true,
      };

      const newAttackApplyState = {
        ...attackApplyState,
        reverseState: newReverseState,
      };

      newMeleeState = {
        ...meleeState,
        ...(firstPlayer === 'white'
          ? { blackAttackApplyState: newAttackApplyState }
          : { whiteAttackApplyState: newAttackApplyState }),
      };
    }

    // Update phase state
    const newPhaseState: ResolveMeleePhaseState<TBoard> = {
      ...resolveMeleePhaseState,
      currentMeleeResolutionState: newMeleeState,
    };

    return {
      ...state,
      boardState: addedUnitBoard,
      currentRoundState: {
        ...state.currentRoundState,
        currentPhaseState: newPhaseState,
      },
    };
  }

  throw new Error(
    `Reverse resolution not expected in phase: ${phaseState.phase}`,
  );
}
