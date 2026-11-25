import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { getBoardCoordinates } from '../board/getBoardCoordinates';
import { findPlayerUnitWithPosition } from '../unitPresence/findPlayerUnitWithPosition';

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
export function getPlayerUnitsWithPlacementOnBoard(
  state: GameState,
  player: PlayerSide,
): Set<UnitWithPlacement> {
  const units = new Set<UnitWithPlacement>();
  const coordinates = getBoardCoordinates(state.boardState);

  // Every space is asked for this side's unit, engaged or not: a unit locked
  // in a fight is still on the board, still needs unit support after a rally
  // (§10.4.4), and still counts against losing the last unit (§11.4).
  for (const coordinate of coordinates) {
    const unitWithPlacement = findPlayerUnitWithPosition(
      state.boardState,
      coordinate,
      player,
    );
    if (unitWithPlacement) {
      units.add(unitWithPlacement);
    }
  }

  // Each of this side's units once, with where it stands and which way it
  // faces.
  return units;
}
