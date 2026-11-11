import type { Command, PlayerSide } from '@entities';
import type { GameState } from '@game';
import { hasInitiative } from '@queries/player';
import { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';

/**
 * The orders a player has still to give in Phase 3 (§4.3.1–4.3.3): what their
 * card allows that they have neither issued nor forfeited.
 *
 * The phase keeps them by order of play, the first player's and the second's,
 * so a caller who knows only whose they are asks here instead of choosing the
 * slot by hand.
 *
 * @param state - The game state, in the Issue Commands phase
 * @param player - The player whose orders to read
 * @returns The player's orders still to give
 * @throws Error if the current phase is not Issue Commands
 */
export function getRemainingCommandsForPlayer(
  state: GameState,
  player: PlayerSide,
): readonly Command[] {
  const phaseState = getIssueCommandsPhaseState(state);
  const remaining = hasInitiative(state, player)
    ? phaseState.remainingCommandsFirstPlayer
    : phaseState.remainingCommandsSecondPlayer;
  return remaining;
}
