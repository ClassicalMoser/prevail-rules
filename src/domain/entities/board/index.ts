// Board size and schema
export { boardSchema, boardType, boardTypeEnum } from './board';
export type { Board, BoardType } from './board';

// Coordinates across all sizes
export { coordinateSchema } from './boardCoordinates';
export type { Coordinate } from './boardCoordinates';

// Spaces on the board
export { boardSpaceSchema } from './boardSpace';
export type { BoardSpace } from './boardSpace';

// Layout lookup
export { getCoordinateLayout } from './coordinateLayout';
export type { CoordinateLayout, CoordinateLayoutMap } from './coordinateLayout';

// Small layout
export { smallCoordinateLayout } from './smallBoard';

// Standard layout
export { standardCoordinateLayout } from './standardBoard';

// Large layout
export { largeCoordinateLayout } from './largeBoard';
