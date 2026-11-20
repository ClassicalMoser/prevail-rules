// Empty small board.
export { createEmptySmallBoard } from './createEmptySmallBoard';

// Empty standard board.
export { createEmptyStandardBoard } from './createEmptyStandardBoard';

// Empty large board.
export { createEmptyLargeBoard } from './createEmptyLargeBoard';

// Each board size's rows, columns, and the spaces they name; and the layout
// for a board's size.
export {
  getCoordinateLayout,
  largeCoordinateLayout,
  smallCoordinateLayout,
  standardCoordinateLayout,
} from './layout';

// Every space of a board's size, with its row and column both ways.
export type { CoordinateGrid } from './layout';
export { getCoordinateGrid } from './layout';
