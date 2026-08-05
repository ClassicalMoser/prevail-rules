/**
 * Shared coordinate-layout contract and the boardType → layout map.
 * Per-size layouts live beside their row/column definitions under
 * smallBoard/, standardBoard/, and largeBoard/.
 */

import type { Board, BoardType } from './board';
import type { Coordinate } from './boardCoordinates';

import { largeCoordinateLayout } from './largeBoard';
import { smallCoordinateLayout } from './smallBoard';
import { standardCoordinateLayout } from './standardBoard';

/**
 * Bundle of a board's row/column definitions plus createCoordinate.
 * Used to iterate the grid or for coordinate arithmetic
 * (getRowIndex/getColumnIndex O(1)).
 */
export interface CoordinateLayout {
  readonly rowLetters: readonly string[];
  readonly columnNumbers: readonly string[];
  createCoordinate: (row: string, column: string) => Coordinate;
  /** O(1) row string → index; -1 if not valid. */
  getRowIndex: (row: string) => number;
  /** O(1) column string → index; -1 if not valid. */
  getColumnIndex: (column: string) => number;
}

export type CoordinateLayoutMap = Record<BoardType, CoordinateLayout>;

export const coordinateLayoutMap: CoordinateLayoutMap = {
  large: largeCoordinateLayout,
  small: smallCoordinateLayout,
  standard: standardCoordinateLayout,
};

export function getCoordinateLayout(board: Board): CoordinateLayout {
  return coordinateLayoutMap[board.boardType];
}
