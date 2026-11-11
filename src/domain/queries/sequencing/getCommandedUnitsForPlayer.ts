import type { PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import { isFriendlyUnit } from '@queries/unit';

/**
 * The units of one player already ordered this round (§4.3.6).
 *
 * @param state - The game state
 * @param player - The player whose ordered units to read
 * @returns Those units, in the order they were ordered
 */
export function getCommandedUnitsForPlayer(
  state: GameState,
  player: PlayerSide,
): UnitInstance[] {
  const commanded = state.currentRoundState.commandedUnits.filter((unit) =>
    isFriendlyUnit(unit, player),
  );
  return commanded;
}
