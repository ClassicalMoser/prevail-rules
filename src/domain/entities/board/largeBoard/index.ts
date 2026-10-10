/**
 * Large-board size barrel: row/column lists, coordinate product, layout value.
 *
 * Widest size; small and standard letter/number sets are prefixes of these.
 * Prefer the parent board barrel for shared {@link Coordinate} and
 * {@link getCoordinateLayout}. Import this barrel when building or testing
 * the large size specifically.
 */

/** Ordered row letters A–X; index = row index for the large layout. */
export { largeBoardRowLetters } from './largeRowLetters';
/** One row letter on a large board. */
export type { LargeBoardRowLetter } from './largeRowLetters';

/** Ordered column numbers 1–36 (digit strings); index = column index. */
export { largeBoardColumnNumbers } from './largeColumnNumbers';
/** One column number on a large board. */
export type { LargeBoardColumnNumber } from './largeColumnNumbers';

/** Closed list `"A-1"` … `"X-36"` and its Zod enum (widest product). */
export {
  largeBoardCoordinateSchema,
  largeBoardCoordinates,
} from './largeCoordinates';
/** A coordinate that exists on a large board. */
export type { LargeBoardCoordinate } from './largeCoordinates';

/** Runtime layout: arrays + createCoordinate / index lookups. */
export { largeCoordinateLayout } from './largeCoordinateLayout';
