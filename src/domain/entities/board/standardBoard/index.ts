/**
 * Standard-board size barrel: row/column lists, coordinate product, layout value.
 *
 * Prefer the parent board barrel for shared {@link Coordinate} and
 * {@link getCoordinateLayout}. Import this barrel when building or testing
 * the standard size specifically.
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

/** Runtime layout: arrays + createCoordinate / index lookups. */
export { standardCoordinateLayout } from './standardCoordinateLayout';
