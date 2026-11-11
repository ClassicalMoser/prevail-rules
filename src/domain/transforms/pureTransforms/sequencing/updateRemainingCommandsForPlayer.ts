import type { Command, PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getIssueCommandsPhaseState, hasInitiative } from '@queries';
import { updatePhaseState } from '../state/updatePhaseState';

/**
 * Writes the orders one player still has to issue, to the slot their
 * initiative gives them, as `getRemainingCommandsForPlayer` reads it.
 *
 * @param state - The game state, in issue commands
 * @param player - The player whose orders these are
 * @param commands - The orders still to issue
 * @returns The game state with those orders written
 */
export function updateRemainingCommandsForPlayer<S extends GameState>(
  state: S,
  player: PlayerSide,
  commands: readonly Command[],
): S {
  const phaseState = getIssueCommandsPhaseState(state);
  const written = hasInitiative(state, player)
    ? { ...phaseState, remainingCommandsFirstPlayer: [...commands] }
    : { ...phaseState, remainingCommandsSecondPlayer: [...commands] };
  const updated = updatePhaseState(state, written);
  return updated;
}
