import type { GameState, ReverseState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';
import { getMeleeAppliesInResolutionOrder } from '@queries/sequencing/meleeResolution/getMeleeAppliesInResolutionOrder';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Active reverse substep from melee resolution (resolution order, §7.5.6), when still awaiting facing resolution.
 *
 * @param state - The game state
 * @returns The reverse whose facing has not been chosen
 * @throws Error when neither side has an open reverse waiting on a facing
 */
export function getNextMeleeReverseState(state: GameState): ReverseState {
  const meleeState = getMeleeResolutionState(state);
  // An attack that reached no threshold leaves reverseState 'bypassed', so
  // that side has nothing to reverse. A finalPosition of 'pending' means the
  // facing has not been chosen yet.
  for (const apply of getMeleeAppliesInResolutionOrder(meleeState)) {
    const reverse = apply.reverseState;
    if (isOpenSubstep(reverse) && reverse.finalPosition === 'pending') {
      return reverse;
    }
  }
  throw new Error('No reverse state found in melee resolution');
}
