/**
 * Small-board size barrel: row/column lists and the coordinate product.
 *
 * Prefer the parent board barrel for the shared {@link Coordinate}. The
 * small layout itself is in `@factories`.
 */

/** Ordered row letters A–H; index = row index for the small layout. */
export { smallBoardRowLetters } from './smallRowLetters';
/** One row letter on a small board. */
export type { SmallBoardRowLetter } from './smallRowLetters';

/** Ordered column numbers 1–12 (digit strings); index = column index. */
export { smallBoardColumnNumbers } from './smallColumnNumbers';
/** One column number on a small board. */
export type { SmallBoardColumnNumber } from './smallColumnNumbers';

/** Closed list `"A-1"` … `"H-12"` and its Zod enum. */
export {
  smallBoardCoordinateSchema,
  smallBoardCoordinates,
} from './smallCoordinates';
/** A coordinate that exists on a small board. */
export type { SmallBoardCoordinate } from './smallCoordinates';
