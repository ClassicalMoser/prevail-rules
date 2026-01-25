import type { Board, GameState, ReverseState } from '@entities';
import type { ResolveReverseEvent } from '@events';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getReverseStateFromAttackApply,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateReverseState,
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
  // Update the unit's facing on the board
  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    event.unitInstance,
  );
  const addedUnitBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    event.newUnitPlacement,
  );

  // Get the current reverse state to update
  const reversingPlayer = event.unitInstance.unit.playerSide;
  const phaseState = state.currentRoundState.currentPhaseState;
  if (!phaseState) {
    throw new Error('No current phase state found');
  }

  // Get the attack apply state and reverse state based on the current phase
  let attackApplyState;
  if (phaseState.phase === 'issueCommands') {
    // Ranged attack resolution - only one attack apply state possible
    attackApplyState = getAttackApplyStateFromRangedAttack(state);
  } else if (phaseState.phase === 'resolveMelee') {
    // Melee resolution - get attack apply state for the reversing player
    attackApplyState = getAttackApplyStateFromMelee(state, reversingPlayer);
  } else {
    throw new Error(
      `Reverse resolution not expected in phase: ${phaseState.phase}`,
    );
  }

  const currentReverseState = getReverseStateFromAttackApply(attackApplyState);

  // Mark reverse as completed and set final position
  const newReverseState: ReverseState<TBoard> = {
    ...currentReverseState,
    finalPosition: event.newUnitPlacement.placement,
    completed: true,
  };

  // Update the reverse state using the pure transform
  const stateWithUpdatedReverse = updateReverseState(state, newReverseState);

  // Return with board updated
  return {
    ...stateWithUpdatedReverse,
    boardState: addedUnitBoard,
  };
}
