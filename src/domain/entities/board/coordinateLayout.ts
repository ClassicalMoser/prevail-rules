/**
 * Shared coordinate-layout contract and the boardType → layout map.
 * Per-size layouts live beside their row/column definitions under
 * smallBoard/, standardBoard/, and largeBoard/.
 */

import type { Board } from './board';
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
 * Bundle of a board's row/column definitions plus createCoordinate.
 * Used to iterate the grid or for coordinate arithmetic
 * (getRowIndex/getColumnIndex O(1)).
 *
 * Defaults to the large-board letter/number unions: coordinate sets nest
 * (small ⊂ standard ⊂ large), so {@link Coordinate} is extensionally that
 * product. Method syntax keeps parameter checks bivariant so per-size
 * layouts remain assignable to the shared default type.
 */
export interface CoordinateLayout<
  R extends string = LargeBoardRowLetter,
  C extends string = LargeBoardColumnNumber,
> {
  readonly rowLetters: readonly R[];
  readonly columnNumbers: readonly C[];
  createCoordinate(row: R, column: C): `${R}-${C}`;
  /** O(1) row string → index; -1 if not valid. */
  getRowIndex(row: string): number;
  /** O(1) column string → index; -1 if not valid. */
  getColumnIndex(column: string): number;
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
