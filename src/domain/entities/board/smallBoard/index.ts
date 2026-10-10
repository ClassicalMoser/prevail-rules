/**
 * Small-board size barrel: row/column lists, coordinate product, layout value.
 *
 * Prefer the parent board barrel for shared {@link Coordinate} and
 * {@link getCoordinateLayout}. Import this barrel when building or testing
 * the small size specifically.
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

/** Runtime layout: arrays + createCoordinate / index lookups. */
export { smallCoordinateLayout } from './smallCoordinateLayout';
