// Each board size's rows, columns, and the spaces they name.
export { largeCoordinateLayout } from './largeCoordinateLayout';
export { smallCoordinateLayout } from './smallCoordinateLayout';
export { standardCoordinateLayout } from './standardCoordinateLayout';

// The layout for a board's size.
export { getCoordinateLayout } from './coordinateLayoutMap';

// Every space of a board's size, with its row and column both ways.
export type { CoordinateGrid } from './buildCoordinateGrid';
export { getCoordinateGrid } from './coordinateGridMap';
