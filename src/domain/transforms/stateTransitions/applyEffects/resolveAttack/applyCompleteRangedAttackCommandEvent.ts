import type { CompleteRangedAttackCommandEvent } from '@events';
import type { GameState } from '@game';
import { getLegalRangedAttackers } from '@legality';
import { getCommandingPlayer } from '@queries';
import {
  clearCommandResolution,
  finishResolvingCommands,
  updateRemainingUnitsForPlayer,
} from '@transforms/pureTransforms';

/**
 * Clears an in-progress ranged CRS (or no-ops CRS already pending), then either:
 * - keeps only remaining units that still have a legal target, or
 * - if none can shoot, clears that player's remaining units and advances the
 *   resolve step (first → second issue, second → complete).
 *
 * Also used when resolve begins with remaining units that have range but no
 * eligible targets, so the phase does not stall on `performRangedAttack`.
 */
export function applyCompleteRangedAttackCommandEvent<S extends GameState>(
  _event: CompleteRangedAttackCommandEvent,
  state: S,
): S {
  // The unit's part of the order that was under way is done.
  const cleared = clearCommandResolution(state);

  // Keep only the units that can still act on the order; with none, the
  // player's orders are finished.
  const legal = getLegalRangedAttackers(cleared);
  if (legal.attackers.length > 0) {
    const stillToAct = updateRemainingUnitsForPlayer(
      cleared,
      getCommandingPlayer(cleared),
      legal.attackers.map((entry) => entry.unit),
    );
    return stillToAct;
  }
  const finished = finishResolvingCommands(cleared);
  return finished;
}
