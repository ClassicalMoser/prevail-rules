import type {
  Board,
  BoardCoordinate,
  PlayerSide,
  UnitWithPlacement,
} from '@entities';
import { getPlayerUnitWithPosition } from '@queries';

/**
 * Gets a unit with placement from a board at a specific coordinate.
 * This is a convenience helper for tests that frequently need to get
 * a unit's placement from a board.
 *
 * @param board - The board to get the unit from
 * @param coordinate - The coordinate where the unit is located
 * @param playerSide - The player side of the unit
 * @returns The unit with placement, or throws if not found
 * @throws {Error} If the unit is not found at the coordinate
 */
export function getUnitAt<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  playerSide: PlayerSide,
): UnitWithPlacement<TBoard> | undefined {
  const unit = getPlayerUnitWithPosition(board, coordinate, playerSide);
  return unit;
}
