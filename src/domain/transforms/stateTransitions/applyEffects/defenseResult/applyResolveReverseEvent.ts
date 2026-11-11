import type { ResolveReverseEvent } from '@events';
import type { GameState, ReverseState } from '@game';
import {
  getAttackApplyStateAt,
  getReverseStateFromAttackApply,
} from '@queries';
import { throwIfBypassed } from '@utils';
import {
  moveUnitOnBoard,
  updateBoardState,
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
export function applyResolveReverseEvent<S extends GameState>(
  event: ResolveReverseEvent,
  state: S,
): S {
  // The unit turns about where it stands.
  const addedUnitBoard = moveUnitOnBoard(
    state.boardState,
    event.unitInstance.unit,
    event.newUnitPlacement.placement,
  );

  const attackApplyState = getAttackApplyStateAt(state, {
    attackResolutionContext: event.attackResolutionContext,
    defendingPlayer: event.unitInstance.unit.playerSide,
  });

  const currentReverseState = throwIfBypassed(
    getReverseStateFromAttackApply(attackApplyState),
    'This attack apply applied no reverse to resolve',
  );

  const newReverseState: ReverseState = {
    ...currentReverseState,
    completed: true,
    finalPosition: event.newUnitPlacement.placement,
  };

  const stateWithUpdatedReverse = updateReverseState(state, newReverseState);
  return updateBoardState(stateWithUpdatedReverse, addedUnitBoard);
}
