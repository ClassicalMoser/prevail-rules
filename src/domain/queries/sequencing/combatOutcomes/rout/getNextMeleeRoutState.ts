import type { GameState, RoutState } from '@game';
import { isOpenSubstep } from '../isOpenSubstep';
import { getMeleeResolutionState } from '@queries/sequencing/meleeResolution/getMeleeResolutionState';

/**
 * Rout state from melee resolution, in initiative order (first player's apply first).
 * Assumes resolveMelee phase and that one attack-apply carries an active rout.
 *
 * @param state - The game state
 * @returns The first open rout in initiative order
 * @throws Error when neither apply has an open rout
 */
// TODO(wrong): an open rout is returned even when it is already paid
// (`completed`), so once the first side's rout is settled this still answers
// with it. Its retreat and reverse siblings filter on what is still owed. No
// production caller, so nothing breaks yet. Settled by a spec with the first
// rout completed and the second open, then a filter, or deleting it.
export function getNextMeleeRoutState(state: GameState): RoutState {
  const meleeState = getMeleeResolutionState(state);
  const firstApply = meleeState.firstPlayerAttackApplyState;
  const secondApply = meleeState.secondPlayerAttackApplyState;

  // An attack that reached no threshold leaves routState 'bypassed', so that
  // side has nothing to rout.
  // A pending apply is skipped. The second player is checked only then.
  if (firstApply !== 'pending' && isOpenSubstep(firstApply.routState)) {
    return firstApply.routState;
  }
  if (secondApply !== 'pending' && isOpenSubstep(secondApply.routState)) {
    return secondApply.routState;
  }
  throw new Error('No rout state found in melee resolution');
}
