/**
 * Board package barrel.
 *
 * Public surface: board schema/types, the shared {@link Coordinate} vocabulary,
 * spaces, and layout lookup. Per-size row/column lists and coordinate enums
 * stay under `smallBoard/` / `standardBoard/` / `largeBoard/` — import those
 * barrels only when building or testing a specific size.
 *
 * `joinCoordinate` is intentionally omitted: layout-internal only.
 */

/** Board size literals, Zod enum, and full-board schema. */
export { boardSchema, boardType, boardTypeEnum } from './board';
/** Board state shape and `boardType` discriminator. */
export type { Board, BoardType } from './board';

/** Zod enum over every known coordinate string. */
export { coordinateSchema } from './boardCoordinates';
/** Shared coordinate vocabulary across all board sizes. */
export type { Coordinate } from './boardCoordinates';

/** Schema for one board cell (terrain, elevation, water, occupancy). */
export { boardSpaceSchema } from './boardSpace';
/** One cell of the board. */
export type { BoardSpace } from './boardSpace';

/** Layout for a board's current `boardType`. */
export { getCoordinateLayout } from './coordinateLayout';
/** Layout contract and `boardType` → layout map type. */
export type { CoordinateLayout, CoordinateLayoutMap } from './coordinateLayout';

/** Small-board layout value (also via {@link getCoordinateLayout}). */
export { smallCoordinateLayout } from './smallBoard';
/** Standard-board layout value (also via {@link getCoordinateLayout}). */
export { standardCoordinateLayout } from './standardBoard';
/** Large-board layout value (also via {@link getCoordinateLayout}). */
export { largeCoordinateLayout } from './largeBoard';
