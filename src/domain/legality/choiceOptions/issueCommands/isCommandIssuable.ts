import type { Command, PlayerSide } from '@entities';
import type { GameState } from '@game';

import { getLegalUnitsForIssueCommand } from './getLegalUnitsForIssueCommand';

/**
 * Whether `command` can be issued for `player` under current board /
 * commanded-units state.
 *
 * `size: 'units'`: issuable iff ≥1 fully-restricted eligible unit
 * (`command.number` is a **cap** on how many may be selected, not a quota).
 *
 * `size: 'lines'`: issuable iff ≥1 legal start (start itself is always a
 * legal end).
 *
 * TODO(composition): nothing in production calls this any more. The issue
 * step used it to choose between asking for an order and asking the player to
 * stop; the player now issues one allocation, and ordering nobody is always
 * legal, so the step asks for issueCommands either way. Settled by
 * deprecating and removing it, or by finding the caller that should use it
 * (the bot, to tell an order with no legal units from one it does not want).
 *
 * @param command - The command on the card in play
 * @param player - The player issuing it
 * @param gameState - The current game state
 * @returns Whether any unit meets the order's full restrictions
 */
export function isCommandIssuable(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
): boolean {
  // A units order needs one eligible unit to name, and a line needs one unit
  // within range to anchor it (§4.3.5); a line of one is that unit alone, so
  // the same list answers both.
  const eligible = getLegalUnitsForIssueCommand(command, player, gameState);

  // Issuable when anyone at all may take the order; the printed number is a
  // ceiling, so one is enough (§4.3.2).
  const issuable = eligible.length > 0;
  return issuable;
}
