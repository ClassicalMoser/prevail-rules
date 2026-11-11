import type { ResolveReverseEvent } from '@events';
import type { GameState, ReverseState } from '@game';
import {
  getAttackApplyStateOfPlayer,
  getPositionOfUnit,
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
  // The unit turns about where it stands, to the facing the procedure worked out.
  const standing = getPositionOfUnit(state.boardState, event.unit);
  const finalPosition = {
    coordinate: standing.coordinate,
    facing: event.facing,
  };
  const addedUnitBoard = moveUnitOnBoard(
    state.boardState,
    event.unit,
    finalPosition,
  );

  const attackApplyState = getAttackApplyStateOfPlayer(
    state,
    event.unit.playerSide,
  );

  const currentReverseState = throwIfBypassed(
    getReverseStateFromAttackApply(attackApplyState),
    'This attack apply applied no reverse to resolve',
  );

  const newReverseState: ReverseState = {
    ...currentReverseState,
    completed: true,
    finalPosition,
  };

  const stateWithUpdatedReverse = updateReverseState(state, newReverseState);
  return updateBoardState(stateWithUpdatedReverse, addedUnitBoard);
}
