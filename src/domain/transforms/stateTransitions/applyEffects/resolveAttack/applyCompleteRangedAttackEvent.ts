import type { CompleteRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { clearCommandResolution } from '@transforms/pureTransforms';

/**
 * Finishes one shot of a Shoot order (§4.3.11): the shooter's turn is over, so
 * the shot is cleared and the next shooter may be chosen. When no ordered unit
 * is left to take a turn, the expected engine asks for
 * completeRangedAttackCommand, which ends the player's orders.
 *
 * Which of the units still to act can shoot is not decided here. A unit with
 * no target when a shooter is chosen is skipped for that choice only, so it
 * keeps its place: a later shot may give it a target.
 *
 * Mirrors `applyCompleteUnitMovementEvent` for a move.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The game state, with a shot whose results are all carried out
 * @returns A new game state with no shot under way, on the same step
 */
export function applyCompleteRangedAttackEvent<S extends GameState>(
  _event: CompleteRangedAttackEvent,
  state: S,
): S {
  // The shooter's part of the order that was under way is done.
  const cleared = clearCommandResolution(state);

  // The same step, with the units still to act kept, for the next shooter
  // or the order's end.
  return cleared;
}
