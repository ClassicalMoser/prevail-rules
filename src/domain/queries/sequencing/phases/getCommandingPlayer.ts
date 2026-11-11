import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { getOtherPlayer } from '@queries/player';
import { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';

/**
 * The player whose orders the issue commands step is on. The first player
 * issues their orders and carries them out, then the second does the same
 * (§4.3), so each issue and resolve step belongs to one of them.
 *
 * This is the one statement of whose step it is; every reader and writer of
 * a player's orders asks it.
 *
 * @param state - The game state, in issue commands
 * @returns The player issuing or carrying out orders now
 * @throws Error when the phase is complete
 */
export function getCommandingPlayer(state: GameState): PlayerSide {
  const { step } = getIssueCommandsPhaseState(state);
  const firstPlayer = state.currentInitiative;
  if (
    step === 'firstPlayerIssueCommands' ||
    step === 'firstPlayerResolveCommands'
  ) {
    return firstPlayer;
  }
  if (
    step === 'secondPlayerIssueCommands' ||
    step === 'secondPlayerResolveCommands'
  ) {
    const secondPlayer = getOtherPlayer(firstPlayer);
    return secondPlayer;
  }
  throw new Error(`Issue commands is not on a player's step: ${step}`);
}
