/**
 * Large-board {@link CoordinateLayout} value.
 *
 * Same contract as the small/standard layouts: row/column arrays are the size
 * identity; callables take `string` and join/lookup without re-proving size
 * in the type system. Large's letter/number sets are the widest; nested sizes
 * are subsets. See {@link smallCoordinateLayout} for the pattern.
 *
 * Index maps are built once at module load; unknown part strings return `-1`.
 */

import { joinCoordinate } from '../boardCoordinates';
import type { CoordinateLayout } from '../coordinateLayout';

import type { LargeBoardColumnNumber } from './largeColumnNumbers';
import { largeBoardColumnNumbers } from './largeColumnNumbers';
import type { LargeBoardRowLetter } from './largeRowLetters';
import { largeBoardRowLetters } from './largeRowLetters';

// Prebuilt for O(1) getRowIndex / getColumnIndex (hot path in step queries).
const rowIndexMap = new Map<string, number>(
  largeBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  largeBoardColumnNumbers.map((s, i) => [s, i]),
);

export const largeCoordinateLayout: CoordinateLayout<
  LargeBoardRowLetter,
  LargeBoardColumnNumber
> = {
  /** Large columns 1–36; identity of this size together with `rowLetters`. */
  columnNumbers: largeBoardColumnNumbers,
  // Unknown pairs throw inside joinCoordinate; callers should pass parts from
  // these arrays (or indices already bounded against them).
  createCoordinate: (row, column) => joinCoordinate(row, column),
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  /** Large rows A–X; identity of this size together with `columnNumbers`. */
  rowLetters: largeBoardRowLetters,
};
