import type { Board } from '@entities';
import type { ResolveReverseEvent } from '@events';
import type { GameState, ReverseState } from '@game';
import {
  getAttackApplyStateFromMelee,
  getAttackApplyStateFromRangedAttack,
  getReverseStateFromAttackApply,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
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
export function applyResolveReverseEvent<TBoard extends Board>(
  event: ResolveReverseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    event.unitInstance,
  );
  const addedUnitBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    event.newUnitPlacement,
  );

  const attackApplyState =
    event.attackResolutionContext === 'rangedAttack'
      ? getAttackApplyStateFromRangedAttack(state)
      : getAttackApplyStateFromMelee(state, event.unitInstance.unit.playerSide);

  const currentReverseState = getReverseStateFromAttackApply(attackApplyState);

  const newReverseState: ReverseState<TBoard> = {
    ...currentReverseState,
    finalPosition: event.newUnitPlacement.placement,
    completed: true,
  };

  const stateWithUpdatedReverse = updateReverseState(state, newReverseState);
  return updateBoardState(stateWithUpdatedReverse, addedUnitBoard);
}
