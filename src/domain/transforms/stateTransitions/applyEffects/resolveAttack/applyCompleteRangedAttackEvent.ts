import type { CompleteRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { getCommandingPlayer, getRemainingUnitsForPlayer } from '@queries';
import {
  clearCommandResolution,
  finishResolvingCommands,
} from '@transforms/pureTransforms';

/**
 * Finishes one shot of a Shoot order (§4.3.11): the shooter's turn is over, so
 * the shot is cleared and the next shooter may be chosen. The player's orders
 * end when no ordered unit is left to take a turn.
 *
 * Which of the units still to act can shoot is not decided here. A unit with
 * no target when a shooter is chosen is skipped for that choice only, so it
 * keeps its place: a later shot may give it a target.
 *
 * Mirrors {@link applyCompleteUnitMovementEvent} for a move.
 */
export function applyCompleteRangedAttackEvent<S extends GameState>(
  _event: CompleteRangedAttackEvent,
  state: S,
): S {
  // The shooter's part of the order that was under way is done.
  const cleared = clearCommandResolution(state);

  // The player's orders are finished once no ordered unit is left to act.
  const player = getCommandingPlayer(cleared);
  if (getRemainingUnitsForPlayer(cleared, player).length > 0) {
    return cleared;
  }
  const finished = finishResolvingCommands(cleared);
  return finished;
}
