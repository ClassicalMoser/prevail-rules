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
 */
export function isCommandIssuable(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
): boolean {
  return getLegalUnitsForIssueCommand(command, player, gameState).length > 0;
}
