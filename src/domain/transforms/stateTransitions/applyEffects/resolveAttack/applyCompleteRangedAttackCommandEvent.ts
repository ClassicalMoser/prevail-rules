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
 * with no shot under way. A finished shot is `applyCompleteRangedAttackEvent`'s.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The game state, on a player's resolve step of a Shoot order
 * @returns A new game state on the step that follows, with that player's units left dropped
 */
export function applyCompleteRangedAttackCommandEvent<S extends GameState>(
  _event: CompleteRangedAttackCommandEvent,
  state: S,
): S {
  // No shooter can be chosen, so nothing remains of the order: the units
  // still listed are dropped, and the step moves on (§4.3.3, §4.3.11).
  const finished = finishResolvingCommands(state);

  // The second player's issuing, or the phase complete.
  return finished;
}
