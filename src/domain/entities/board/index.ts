/**
 * Board package barrel.
 *
 * Public surface: the board schema and its shape, a board space, and where a
 * space sits. The board's vocabulary, its sizes, labels, spaces and each
 * size's layout, is declared in `@ruleValues` and re-exported here, so a
 * reader of a board finds it beside the board.
 */

/** Full-board schema. */
export { boardSchema } from './board';
/** Board state shape. */
export type { Board } from './board';

/** Board size literals and their Zod enum, from `@ruleValues`. */
export { boardType, boardTypeEnum } from '@ruleValues';
/** Which size a board is, from `@ruleValues`. */
export type { BoardType } from '@ruleValues';

/** Every space on some board, and the Zod enum over them, from `@ruleValues`. */
export { allCoordinates, coordinateSchema } from '@ruleValues';
/** Shared coordinate vocabulary across all board sizes, from `@ruleValues`. */
export type { Coordinate } from '@ruleValues';

/** Each size's depth, frontage and spaces, keyed by size, from `@ruleValues`. */
export { coordinateLayoutMap } from '@ruleValues';
/** A size's layout, and the map of them, from `@ruleValues`. */
export type { CoordinateLayout, CoordinateLayoutMap } from '@ruleValues';

/** Schema for one board cell (terrain, elevation, water, occupancy). */
export { boardSpaceSchema } from './boardSpace';
/** One cell of the board. */
export type { BoardSpace } from './boardSpace';

/** Where a space sits on its board, as row and column counted from 0. */
export type { GridPosition } from './gridPosition';
