import type { CompleteMovementCommandEvent } from '@events';
import type { GameState } from '@game';
import { getLegalMoveUnits } from '@legality';
import { getCommandingPlayer } from '@queries';
import {
  clearCommandResolution,
  finishResolvingCommands,
  updateRemainingUnitsForPlayer,
} from '@transforms/pureTransforms';

/**
 * Clears an in-progress movement CRS (or no-ops CRS already pending), then either:
 * - keeps only remaining units that can still legally start a move, or
 * - if none can move, clears that player's remaining units and advances the
 *   resolve step (first → second issue, second → complete).
 *
 * Used when resolve begins with remaining units that cannot move (e.g. engaged),
 * so the phase does not stall on `moveUnit`.
 */
export function applyCompleteMovementCommandEvent<S extends GameState>(
  _event: CompleteMovementCommandEvent,
  state: S,
): S {
  // The unit's part of the order that was under way is done.
  const cleared = clearCommandResolution(state);

  // Keep only the units that can still act on the order; with none, the
  // player's orders are finished.
  const legal = getLegalMoveUnits(cleared);
  if (legal.units.length > 0) {
    const stillToAct = updateRemainingUnitsForPlayer(
      cleared,
      getCommandingPlayer(cleared),
      legal.units.map((entry) => entry.unit),
    );
    return stillToAct;
  }
  const finished = finishResolvingCommands(cleared);
  return finished;
}
