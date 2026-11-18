import type { CompleteIssuingCommandsEvent } from '@events';
import type { GameState } from '@game';
import { beginResolvingCommands } from '@transforms/pureTransforms';

/**
 * Applies a CompleteIssuingCommandsEvent: the player has no order left to
 * issue, so they move on to carrying out the orders given (§4.3). The units
 * they ordered become the units still to act.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The current game state
 * @returns A new game state on the player's resolve step
 */
export function applyCompleteIssuingCommandsEvent<S extends GameState>(
  _event: CompleteIssuingCommandsEvent,
  state: S,
): S {
  // Issuing is done; the orders given are carried out next.
  const resolving = beginResolvingCommands(state);
  return resolving;
}
