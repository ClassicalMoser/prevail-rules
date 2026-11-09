import type { GameState, RoutState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';
import { getMeleeAppliesInResolutionOrder } from '@queries/sequencing/meleeResolution/getMeleeAppliesInResolutionOrder';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Rout state from melee resolution, in resolution order (the second player's unit first, §7.5.6).
 * Assumes resolveMelee phase and that one attack-apply carries an active rout.
 *
 * @param state - The game state
 * @returns The first open rout in resolution order
 * @throws Error when neither apply has an open rout
 */
// TODO(wrong): an open rout is returned even when it is already paid
// (`completed`), so once the first side's rout is settled this still answers
// with it. Its retreat and reverse siblings filter on what is still owed. No
// production caller, so nothing breaks yet. Settled by a spec with the first
// rout completed and the second open, then a filter, or deleting it.
export function getNextMeleeRoutState(state: GameState): RoutState {
  const meleeState = getMeleeResolutionState(state);
  // An attack that reached no threshold leaves routState 'bypassed', so that
  // side has nothing to rout.
  for (const apply of getMeleeAppliesInResolutionOrder(meleeState)) {
    if (isOpenSubstep(apply.routState)) {
      return apply.routState;
    }
  }
  throw new Error('No rout state found in melee resolution');
}
