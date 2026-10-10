/**
 * Shared coordinate-layout contract and the `boardType` → layout map.
 *
 * A layout is the runtime identity of a board size: ordered row letters,
 * ordered column numbers, and the ops geometry queries need (join parts into
 * a {@link Coordinate}, map a part string to an index for step/arc math).
 *
 * Per-size values live beside their row/column definitions under
 * `smallBoard/`, `standardBoard/`, and `largeBoard/`. This file only defines
 * the shared shape, the map keyed by {@link Board.boardType}, and
 * {@link getCoordinateLayout}.
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
   * Join a row letter and column number into a {@link Coordinate}.
   * Implementations delegate to {@link joinCoordinate}; unknown pairs throw.
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

/**
 * Singleton map of the three size layouts.
 * Prefer {@link getCoordinateLayout} at call sites that already have a board.
 */
export const coordinateLayoutMap: CoordinateLayoutMap = {
  large: largeCoordinateLayout,
  small: smallCoordinateLayout,
  standard: standardCoordinateLayout,
};

/**
 * Layout for the board's current `boardType`.
 *
 * Thin lookup — no cloning. Callers use `rowLetters` / `columnNumbers` for
 * bounds and the create/index ops for geometry. The return type is the
 * unspecialized {@link CoordinateLayout} (large defaults) so callers do not
 * need a generic tied to `boardType`.
 *
 * @param board - Board whose `boardType` selects the layout
 * @returns The shared layout value for that size
 */
export function getCoordinateLayout(board: Board): CoordinateLayout {
  return coordinateLayoutMap[board.boardType];
}
