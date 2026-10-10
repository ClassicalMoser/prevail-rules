/**
 * Standard-board {@link CoordinateLayout} value.
 *
 * Same contract as the small/large layouts: row/column arrays are the size
 * identity; callables take `string` and join/lookup without re-proving size
 * in the type system. See {@link smallCoordinateLayout} for the pattern.
 *
 * Index maps are built once at module load; unknown part strings return `-1`.
 */

import { joinCoordinate } from '../boardCoordinates';
import type { CoordinateLayout } from '../coordinateLayout';

import type { StandardBoardColumnNumber } from './standardColumnNumbers';
import { standardBoardColumnNumbers } from './standardColumnNumbers';
import type { StandardBoardRowLetter } from './standardRowLetters';
import { standardBoardRowLetters } from './standardRowLetters';

// Prebuilt for O(1) getRowIndex / getColumnIndex (hot path in step queries).
const rowIndexMap = new Map<string, number>(
  standardBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  standardBoardColumnNumbers.map((s, i) => [s, i]),
);

export const standardCoordinateLayout: CoordinateLayout<
  StandardBoardRowLetter,
  StandardBoardColumnNumber
> = {
  /** Standard columns 1–18; identity of this size together with `rowLetters`. */
  columnNumbers: standardBoardColumnNumbers,
  // Unknown pairs throw inside joinCoordinate; callers should pass parts from
  // these arrays (or indices already bounded against them).
  createCoordinate: (row, column) => joinCoordinate(row, column),
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  /** Standard rows A–L; identity of this size together with `columnNumbers`. */
  rowLetters: standardBoardRowLetters,
};
