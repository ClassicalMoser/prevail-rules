/**
 * Small-board {@link CoordinateLayout} value.
 *
 * Holds the small row/column arrays and the ops geometry queries use:
 * join a row+column into a {@link Coordinate}, or map a part string to an
 * index for step math. Size is this object's data, not a type brand on the
 * callables — `createCoordinate` takes `string` and validates via
 * {@link joinCoordinate}.
 *
 * Index maps are built once at module load; step/adjacency queries hit them
 * on the hot path. Unknown part strings return `-1` (callers treat that as
 * off-board for this size).
 */

import { joinCoordinate } from '../boardCoordinates';
import type { CoordinateLayout } from '../coordinateLayout';

import type { SmallBoardColumnNumber } from './smallColumnNumbers';
import { smallBoardColumnNumbers } from './smallColumnNumbers';
import type { SmallBoardRowLetter } from './smallRowLetters';
import { smallBoardRowLetters } from './smallRowLetters';

// Prebuilt for O(1) getRowIndex / getColumnIndex (hot path in step queries).
const rowIndexMap = new Map<string, number>(
  smallBoardRowLetters.map((s, i) => [s, i]),
);
const columnIndexMap = new Map<string, number>(
  smallBoardColumnNumbers.map((s, i) => [s, i]),
);

export const smallCoordinateLayout: CoordinateLayout<
  SmallBoardRowLetter,
  SmallBoardColumnNumber
> = {
  /** Small columns 1–12; identity of this size together with `rowLetters`. */
  columnNumbers: smallBoardColumnNumbers,
  // Unknown pairs throw inside joinCoordinate; callers should pass parts from
  // these arrays (or indices already bounded against them).
  createCoordinate: (row, column) => joinCoordinate(row, column),
  getColumnIndex: (col) => columnIndexMap.get(col) ?? -1,
  getRowIndex: (row) => rowIndexMap.get(row) ?? -1,
  /** Small rows A–H; identity of this size together with `columnNumbers`. */
  rowLetters: smallBoardRowLetters,
};
