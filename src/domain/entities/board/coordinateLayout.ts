/**
 * Shared coordinate-layout contract and the `boardType` → layout map type.
 *
 * A layout is the runtime identity of a board size: ordered row letters,
 * ordered column numbers, and the ops geometry queries need (join parts into
 * a {@link Coordinate}, map a part string to an index for step/arc math).
 *
 * The layout values, their map and `getCoordinateLayout` are functions, so
 * they live in `@factories` (`factories/board/layout/`). This file only
 * declares their shape.
 */

import type { Coordinate } from './boardCoordinates';
import type { LargeBoardColumnNumber, LargeBoardRowLetter } from './largeBoard';
import type { SmallBoardColumnNumber, SmallBoardRowLetter } from './smallBoard';
import type {
  StandardBoardColumnNumber,
  StandardBoardRowLetter,
} from './standardBoard';

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
 *
 * Ops are **property** signatures (not methods) so assignability stays
 * contravariant on parameters — important when the shared callable type is
 * `(row: string, column: string) => Coordinate`.
 */
export interface CoordinateLayout<
  R extends string = LargeBoardRowLetter,
  C extends string = LargeBoardColumnNumber,
> {
  /** Ordered row letters for this size; index = row index in step math. */
  readonly rowLetters: readonly R[];
  /** Ordered column numbers (digit strings) for this size; index = column index. */
  readonly columnNumbers: readonly C[];
  /**
   * Names the space at a row letter and column number on this board.
   * Throws when the row or column is not this size's, including a space only
   * a larger board has.
   */
  createCoordinate: (row: string, column: string) => Coordinate;
  /** O(1) row string → index; `-1` if not valid for this layout. */
  getRowIndex: (row: string) => number;
  /** O(1) column string → index; `-1` if not valid for this layout. */
  getColumnIndex: (column: string) => number;
}

/**
 * Layouts keyed by {@link BoardType} / `board.boardType`.
 * Keys match the `boardType` enum literals exactly.
 */
export interface CoordinateLayoutMap {
  large: CoordinateLayout<LargeBoardRowLetter, LargeBoardColumnNumber>;
  small: CoordinateLayout<SmallBoardRowLetter, SmallBoardColumnNumber>;
  standard: CoordinateLayout<StandardBoardRowLetter, StandardBoardColumnNumber>;
}
