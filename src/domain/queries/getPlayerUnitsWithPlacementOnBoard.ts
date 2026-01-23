import type {
  Board,
  GameState,
  PlayerSide,
  UnitWithPlacement,
} from '@entities';
import { getBoardCoordinates } from './boardSpace';
import { getPlayerUnitWithPosition } from './unitPresence';

/**
 * Gets all unit instances with their placements for a player that are currently on the board.
 *
 * @param state - The current game state
 * @param player - The player whose units to get
 * @returns Set of unit instances with placements on the board belonging to the player
 *
 * @example
 * ```typescript
 * const units = getPlayerUnitsWithPlacementOnBoard(state, 'white');
 * // Returns Set([{unit, placement}, {unit, placement}, ...])
 * ```
 */
export function getPlayerUnitsWithPlacementOnBoard<TBoard extends Board>(
  state: GameState<TBoard>,
  player: PlayerSide,
): Set<UnitWithPlacement<TBoard>> {
  const units = new Set<UnitWithPlacement<TBoard>>();
  const coordinates = getBoardCoordinates(state.boardState);

  for (const coordinate of coordinates) {
    const unitWithPlacement = getPlayerUnitWithPosition(
      state.boardState,
      coordinate,
      player,
    );
    if (unitWithPlacement) {
      units.add(unitWithPlacement);
    }
  }

  return units;
}
