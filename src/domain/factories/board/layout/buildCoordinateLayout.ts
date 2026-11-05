import type { BoardType, CoordinateLayout } from '@entities';
import { joinCoordinate } from './joinCoordinate';

/**
 * Builds the layout of one board size from its rows and columns.
 *
 * Index maps are built once at module load; step/adjacency queries hit them
 * on the hot path. Unknown part strings return `-1` (callers treat that as
 * off-board for this size).
 *
 * @param boardType - The size this layout belongs to, named in errors
 * @param rowLetters - The size's rows, in order from A
 * @param columnNumbers - The size's columns, in order from 1
 * @returns The layout for that size
 */
export function buildCoordinateLayout<R extends string, C extends string>(
  boardType: BoardType,
  rowLetters: readonly R[],
  columnNumbers: readonly C[],
): CoordinateLayout<R, C> {
  // Prebuilt for O(1) getRowIndex / getColumnIndex (hot path in step queries).
  const rowIndexMap = new Map<string, number>(
    rowLetters.map((row, index) => [row, index]),
  );
  const columnIndexMap = new Map<string, number>(
    columnNumbers.map((column, index) => [column, index]),
  );

  const layout: CoordinateLayout<R, C> = {
    columnNumbers,
    createCoordinate: (row, column) => {
      // A space on this board has one of this board's rows and one of its
      // columns. A space only a larger board has is off this one.
      if (!rowIndexMap.has(row) || !columnIndexMap.has(column)) {
        throw new Error(
          `Invalid coordinate for ${boardType} board: ${row}-${column}`,
        );
      }
      // The space's name, from the vocabulary every board shares.
      return joinCoordinate(row, column);
    },
    getColumnIndex: (column) => columnIndexMap.get(column) ?? -1,
    getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
    rowLetters,
  };
  return layout;
}
