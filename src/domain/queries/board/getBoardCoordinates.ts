import type { Board, Coordinate } from '@entities';
import { coordinateLayoutMap } from '@entities';

/**
 * Gets all coordinates for a board in a type-safe way.
 * Reads them from the layout for the board's size, which lists them once, so
 * a walk over the board does not name every space afresh.
 *
 * @param board - The board to get coordinates for
 * @returns An array of all valid coordinates for the board type
 *
 * @example
 * ```typescript
 * const standardBoard: Board = createEmptyStandardBoard();
 * const coordinates = getBoardCoordinates(standardBoard);
 * // Returns Coordinate[]
 * ```
 */
export function getBoardCoordinates(board: Board): readonly Coordinate[] {
  // Every space of this size, row by row: the same list for every board of
  // that size, so it is shared, not rebuilt.
  const { coordinates } = coordinateLayoutMap[board.boardType];
  return coordinates;
}
