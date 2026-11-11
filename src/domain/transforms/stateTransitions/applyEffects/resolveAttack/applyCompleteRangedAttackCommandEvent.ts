import type { CompleteRangedAttackCommandEvent } from '@events';
import type { GameState } from '@game';
import { finishResolvingCommands } from '@transforms/pureTransforms';

/**
 * Ends a player's Shoot order when no shooter can be chosen (§4.3.11 step 1):
 * the order was given to no unit, or none of the units still to act has a
 * target. The units left are skipped, the player's remaining orders are
 * finished, and the resolve step advances (first → second issue, second →
 * complete).
 *
 * The expected engine asks for this only at the start of a shooter's choice,
 * with no shot under way. A finished shot is {@link applyCompleteRangedAttackEvent}'s.
 */
export function applyCompleteRangedAttackCommandEvent<S extends GameState>(
  _event: CompleteRangedAttackCommandEvent,
  state: S,
): S {
  const finished = finishResolvingCommands(state);
  return finished;
}
