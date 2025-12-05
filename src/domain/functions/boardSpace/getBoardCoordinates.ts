import type { Board, BoardCoordinate } from '@entities';
import { getBoardConfig } from '@entities';

/**
 * Gets all coordinates for a board in a type-safe way.
 * Uses the board's configuration to generate all valid coordinates.
 *
 * @param board - The board to get coordinates for
 * @returns An array of all valid coordinates for the board type
 *
 * @example
 * ```typescript
 * const standardBoard: StandardBoard = createEmptyStandardBoard();
 * const coordinates = getBoardCoordinates(standardBoard);
 * // Returns StandardBoardCoordinate[]
 * ```
 */
export function getBoardCoordinates<TBoard extends Board>(
  board: TBoard,
): readonly BoardCoordinate<TBoard>[] {
  const config = getBoardConfig(board);
  const coordinates: BoardCoordinate<TBoard>[] = [];
  for (const row of config.rowLetters) {
    for (const column of config.columnNumbers) {
      coordinates.push(config.createCoordinate(row, column));
    }
  }
  return coordinates;
}


