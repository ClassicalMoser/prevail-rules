/**
 * Board package barrel.
 *
 * Public surface: the board schema and its shape, a board space, and where a
 * space sits. The board's vocabulary, its sizes, labels, spaces and each
 * size's layout, is declared in `@ruleValues`, and read from there.
 */

/** Full-board schema. */
export { boardSchema } from './board';
/** Board state shape. */
export type { Board } from './board';

/** Schema for one board cell (cover, difficulty, sight, elevation, occupancy). */
export { boardSpaceSchema } from './boardSpace';
/** One cell of the board. */
export type { BoardSpace } from './boardSpace';

/** Where a space sits on its board, as row and column counted from 0. */
export type { GridPosition } from './gridPosition';
