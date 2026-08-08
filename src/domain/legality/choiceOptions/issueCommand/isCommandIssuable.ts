import type { Command, PlayerSide } from '@entities';
import type { GameState } from '@game';

import { getLegalUnitsForIssueCommand } from './getLegalUnitsForIssueCommand';

/**
 * Whether `command` can be fully issued for `player` under current board /
 * commanded-units state (`units` needs ≥ `number` eligible; `lines` needs ≥1
 * legal start — start itself is always a legal end).
 */
export function isCommandIssuable(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
): boolean {
  const eligible = getLegalUnitsForIssueCommand(command, player, gameState);
  if (command.size === 'units') {
    return eligible.length >= command.number;
  }
  return eligible.length > 0;
}
