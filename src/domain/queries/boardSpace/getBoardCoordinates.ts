import type { Board, Coordinate } from '@entities';
import { getCoordinateLayout } from '@entities';

/**
 * Gets all coordinates for a board in a type-safe way.
 * Uses the board's coordinate layout to generate all valid coordinates.
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
  const layout = getCoordinateLayout(board);
  const coordinates: Coordinate[] = [];
  for (const row of layout.rowLetters) {
    for (const column of layout.columnNumbers) {
      coordinates.push(layout.createCoordinate(row, column));
    }
  }
  return coordinates;
}
