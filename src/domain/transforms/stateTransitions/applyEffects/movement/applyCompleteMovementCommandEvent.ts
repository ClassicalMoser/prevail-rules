import type { CompleteMovementCommandEvent } from '@events';
import type { GameState } from '@game';
import {
  clearCommandResolution,
  finishResolvingCommands,
} from '@transforms/pureTransforms';

/**
 * Ends a Move order once none of the units it ordered is left to move
 * (§4.3.9). The expected engine asks for this effect only when no unit can
 * start a move, so applying it finishes the player's orders: any unit still
 * listed is dropped, and the resolve step advances (first player's to the
 * second player's issuing, second player's to complete).
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The current game state
 * @returns A new game state with the player's orders finished
 */
export function applyCompleteMovementCommandEvent<S extends GameState>(
  _event: CompleteMovementCommandEvent,
  state: S,
): S {
  // The unit's part of the order that was under way is done.
  const cleared = clearCommandResolution(state);

  // No unit is left to move, so the player's orders are finished.
  const finished = finishResolvingCommands(cleared);
  return finished;
}
