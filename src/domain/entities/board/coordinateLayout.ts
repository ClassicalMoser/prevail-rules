/**
 * Shared coordinate-layout contract and the boardType → layout map.
 * Per-size layouts live beside their row/column definitions under
 * smallBoard/, standardBoard/, and largeBoard/.
 */

import type { Board } from './board';
import type { Coordinate } from './boardCoordinates';
import type { LargeBoardColumnNumber, LargeBoardRowLetter } from './largeBoard';
import type { SmallBoardColumnNumber, SmallBoardRowLetter } from './smallBoard';
import type {
  StandardBoardColumnNumber,
  StandardBoardRowLetter,
} from './standardBoard';

import { largeCoordinateLayout } from './largeBoard';
import { smallCoordinateLayout } from './smallBoard';
import { standardCoordinateLayout } from './standardBoard';

/**
 * Bundle of a board's row/column definitions plus coordinate ops.
 *
 * Board size is a **value** on each layout instance (`rowLetters` /
 * `columnNumbers`), not a type parameter that callables must re-prove.
 * `createCoordinate` therefore takes `string` parts: callers pass letters and
 * numbers from this layout's arrays (or from index math already bounded
 * against them). {@link Coordinate} remains the typed vocabulary of joined
 * strings; which keys exist on a given board is enforced at Zod / runtime.
 *
 * Defaults to the large-board letter/number unions because coordinate sets
 * nest (small ⊂ standard ⊂ large), so {@link Coordinate} is extensionally
 * that product. The generics still label each layout's array element types.
 */
export interface CoordinateLayout<
  R extends string = LargeBoardRowLetter,
  C extends string = LargeBoardColumnNumber,
> {
  readonly rowLetters: readonly R[];
  readonly columnNumbers: readonly C[];
  createCoordinate: (row: string, column: string) => Coordinate;
  /** O(1) row string → index; -1 if not valid for this layout. */
  getRowIndex: (row: string) => number;
  /** O(1) column string → index; -1 if not valid for this layout. */
  getColumnIndex: (column: string) => number;
}

export interface CoordinateLayoutMap {
  large: CoordinateLayout<LargeBoardRowLetter, LargeBoardColumnNumber>;
  small: CoordinateLayout<SmallBoardRowLetter, SmallBoardColumnNumber>;
  standard: CoordinateLayout<StandardBoardRowLetter, StandardBoardColumnNumber>;
}

export const coordinateLayoutMap: CoordinateLayoutMap = {
  large: largeCoordinateLayout,
  small: smallCoordinateLayout,
  standard: standardCoordinateLayout,
};

export function getCoordinateLayout(board: Board): CoordinateLayout {
  return coordinateLayoutMap[board.boardType];
}
