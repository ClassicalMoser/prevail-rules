import type { GameState, ReverseState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Active reverse substep from melee resolution (initiative order), when still awaiting facing resolution.
 *
 * @param state - The game state
 * @returns The reverse whose facing has not been chosen
 * @throws Error when neither side has an open reverse waiting on a facing
 */
export function getNextMeleeReverseState(state: GameState): ReverseState {
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

  // An attack that reached no threshold leaves reverseState 'bypassed', so
  // that side has nothing to reverse.
  // finalPosition `'pending'` means the facing has not been chosen yet.

  // We resolve in order; return first if open, otherwise second.
  if (firstPlayerAttackApply !== 'pending') {
    const firstReverse = firstPlayerAttackApply.reverseState;
    if (
      isOpenSubstep(firstReverse) &&
      firstReverse.finalPosition === 'pending'
    ) {
      return firstReverse;
    }
  }
  if (secondPlayerAttackApply !== 'pending') {
    const secondReverse = secondPlayerAttackApply.reverseState;
    if (
      isOpenSubstep(secondReverse) &&
      secondReverse.finalPosition === 'pending'
    ) {
      return secondReverse;
    }
  }
  throw new Error('No reverse state found in melee resolution');
}
