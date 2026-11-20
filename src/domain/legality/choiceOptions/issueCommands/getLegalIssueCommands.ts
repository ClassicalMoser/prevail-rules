import type { Command, PlayerSide } from '@entities';
import type { GameState } from '@game';
import {
  getCardInPlay,
  getCommandingPlayer,
  getIssueCommandsPhaseState,
} from '@queries';

/**
 * What a player issuing their orders may spend: the command on their card in
 * play (§4.3.1). The allocations it allows are too many to list whole, so
 * they are offered a part at a time: the units of a units order by
 * `getLegalUnitsToOrder`, and the lines of a lines order by
 * `getLegalLinesToOrder`.
 */
export interface LegalIssueCommands {
  /** The player issuing their orders. */
  player: PlayerSide;
  /** The command on their card in play. */
  command: Command;
}

/**
 * The player on the issuing step, and the command they spend.
 *
 * The expected engine asks for orders only on an issuing step, so being
 * asked anywhere else is the caller's mistake and throws.
 *
 * @param gameState - The current game state
 * @returns The issuing player and their card's command
 * @throws Error outside the issue commands phase, or off an issuing step
 */
export function getLegalIssueCommands<S extends GameState>(
  gameState: S,
): LegalIssueCommands {
  const { step } = getIssueCommandsPhaseState(gameState);
  if (
    step !== 'firstPlayerIssueCommands' &&
    step !== 'secondPlayerIssueCommands'
  ) {
    throw new Error(`Not on an issuing step: ${step}`);
  }

  // The player whose step it is spends the command on their card in play.
  const player = getCommandingPlayer(gameState);
  const { command } = getCardInPlay(gameState.cardState, player);
  const legal: LegalIssueCommands = { command, player };
  return legal;
}
