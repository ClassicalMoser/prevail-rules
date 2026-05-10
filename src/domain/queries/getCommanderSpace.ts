import type { Board, BoardCoordinate, PlayerSide } from '@entities';
import { getBoardCoordinates, getBoardSpace } from './boardSpace';

/**
 * Gets the board coordinate containing the commander for a given player side.
 *
 * @param side - The player side to get the commander space for
 * @param board - The board to search
 * @returns The board coordinate containing the commander, or undefined if not found
 */
export function getCommanderSpace<TBoard extends Board>(
  side: PlayerSide,
  board: TBoard,
): BoardCoordinate<TBoard> | undefined {
  const coordinates = getBoardCoordinates(board);
  for (const coordinate of coordinates) {
    const space = getBoardSpace(board, coordinate);
    if (space.commanders.has(side)) {
      return coordinate;
    }
  }
  return undefined;
}
