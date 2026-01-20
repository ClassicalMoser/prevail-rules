import type { Board, GameState, PlayerSide, UnitInstance } from '@entities';
import { getBoardCoordinates, getBoardSpace } from './boardSpace';

/**
 * Gets all unit instances for a player that are currently on the board.
 *
 * @param state - The current game state
 * @param player - The player whose units to get
 * @returns Set of unit instances on the board belonging to the player
 *
 * @example
 * ```typescript
 * const units = getPlayerUnitsOnBoard(state, 'white');
 * // Returns Set([unitInstance1, unitInstance2, ...])
 * ```
 */
export function getPlayerUnitsOnBoard<TBoard extends Board>(
  state: GameState<TBoard>,
  player: PlayerSide,
): Set<UnitInstance> {
  const units = new Set<UnitInstance>();
  const coordinates = getBoardCoordinates(state.boardState);

  for (const coordinate of coordinates) {
    const space = getBoardSpace(state.boardState, coordinate);
    const unitPresence = space.unitPresence;

    // Check if this space has units for the player
    if (unitPresence.presenceType === 'unit' && unitPresence.player === player) {
      units.add(unitPresence.unit);
    }
  }

  return units;
}
