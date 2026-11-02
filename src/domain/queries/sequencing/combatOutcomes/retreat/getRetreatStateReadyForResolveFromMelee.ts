import type { GameState, RetreatState } from '@game';
import { isOpenSubstep } from '@utils';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Retreat substep ready for resolveRetreat in melee: finalPosition set, not yet completed.
 * Initiative order matches attack-apply sequencing.
 *
 * @param state - The game state
 * @returns The first retreat in initiative order that has a destination and is not finished
 * @throws Error when neither side has such a retreat
 */
export function getRetreatStateReadyForResolveFromMelee(
  state: GameState,
): RetreatState {
  const meleeState = getMeleeResolutionState(state);
  const firstPlayer = state.currentInitiative;
  const firstPlayerAttackApply =
    firstPlayer === 'white'
      ? meleeState.whiteAttackApplyState
      : meleeState.blackAttackApplyState;
  const secondPlayerAttackApply =
    firstPlayer === 'white'
      ? meleeState.blackAttackApplyState
      : meleeState.whiteAttackApplyState;

  // A miss apply has retreatState 'miss'. That side has nothing to retreat.
  // Ready means a destination is chosen and the retreat move is not finished.
  if (firstPlayerAttackApply !== 'pending') {
    const firstRetreat = firstPlayerAttackApply.retreatState;
    if (
      isOpenSubstep(firstRetreat) &&
      firstRetreat.finalPosition !== 'pending' &&
      !firstRetreat.completed
    ) {
      return firstRetreat;
    }
  }
  if (secondPlayerAttackApply !== 'pending') {
    const secondRetreat = secondPlayerAttackApply.retreatState;
    if (
      isOpenSubstep(secondRetreat) &&
      secondRetreat.finalPosition !== 'pending' &&
      !secondRetreat.completed
    ) {
      return secondRetreat;
    }
  }
  throw new Error(
    'No retreat state with finalPosition found in melee resolution',
  );
}
