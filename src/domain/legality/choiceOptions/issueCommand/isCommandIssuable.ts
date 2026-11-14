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
 * stop; stopping is now an issueCommand with no order, so the step asks for
 * issueCommand either way. Settled by deprecating and removing it, or by
 * finding the caller that should use it (the bot, to tell an order with no
 * legal units from one it does not want).
 */
export function isCommandIssuable(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
): boolean {
  return getLegalUnitsForIssueCommand(command, player, gameState).length > 0;
}
