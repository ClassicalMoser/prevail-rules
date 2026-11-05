/**
 * Board package barrel.
 *
 * Public surface: board schema/types, the shared {@link Coordinate} vocabulary,
 * each size's rows and columns, spaces, and the layout contract. The layout
 * values themselves are in `@factories`.
 */

/** Board size literals, Zod enum, and full-board schema. */
export { boardSchema, boardType, boardTypeEnum } from './board';
/** Board state shape and `boardType` discriminator. */
export type { Board, BoardType } from './board';

/** Every space on some board, and the Zod enum over them. */
export { allCoordinates, coordinateSchema } from './boardCoordinates';
/** Shared coordinate vocabulary across all board sizes. */
export type { Coordinate } from './boardCoordinates';

/** Schema for one board cell (terrain, elevation, water, occupancy). */
export { boardSpaceSchema } from './boardSpace';
/** One cell of the board. */
export type { BoardSpace } from './boardSpace';

/** Layout contract and `boardType` → layout map type. */
export type { CoordinateLayout, CoordinateLayoutMap } from './coordinateLayout';

/** Each size's rows and columns, in order from A and 1. */
export { smallBoardColumnNumbers, smallBoardRowLetters } from './smallBoard';
export type { SmallBoardColumnNumber, SmallBoardRowLetter } from './smallBoard';
export {
  standardBoardColumnNumbers,
  standardBoardRowLetters,
} from './standardBoard';
export type {
  StandardBoardColumnNumber,
  StandardBoardRowLetter,
} from './standardBoard';
export { largeBoardColumnNumbers, largeBoardRowLetters } from './largeBoard';
export type { LargeBoardColumnNumber, LargeBoardRowLetter } from './largeBoard';
