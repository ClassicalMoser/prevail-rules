/**
 * Standard-board size barrel: row/column lists and the coordinate product.
 *
 * Prefer the parent board barrel for the shared {@link Coordinate}. The
 * standard layout itself is in `@factories`.
 */

/** Ordered row letters A–L; index = row index for the standard layout. */
export { standardBoardRowLetters } from './standardRowLetters';
/** One row letter on a standard board. */
export type { StandardBoardRowLetter } from './standardRowLetters';

/** Ordered column numbers 1–18 (digit strings); index = column index. */
export { standardBoardColumnNumbers } from './standardColumnNumbers';
/** One column number on a standard board. */
export type { StandardBoardColumnNumber } from './standardColumnNumbers';

/** Closed list `"A-1"` … `"L-18"` and its Zod enum. */
export {
  standardBoardCoordinateSchema,
  standardBoardCoordinates,
} from './standardCoordinates';
/** A coordinate that exists on a standard board. */
export type { StandardBoardCoordinate } from './standardCoordinates';
