import type { Board, BoardType } from '@entities';
import type { CoordinateGrid } from './buildCoordinateGrid';
import { buildCoordinateGrid } from './buildCoordinateGrid';
import { largeCoordinateLayout } from './largeCoordinateLayout';
import { smallCoordinateLayout } from './smallCoordinateLayout';
import { standardCoordinateLayout } from './standardCoordinateLayout';

/**
 * Each board size's grid, built once when the module loads, beside the
 * layouts in `coordinateLayoutMap`.
 */
const coordinateGridMap: Record<BoardType, CoordinateGrid> = {
  large: buildCoordinateGrid(largeCoordinateLayout),
  small: buildCoordinateGrid(smallCoordinateLayout),
  standard: buildCoordinateGrid(standardCoordinateLayout),
};

/**
 * The grid for a board's size: every space on it, and each space's row and
 * column both ways. Board geometry in `@queries` (`getBoardCoordinates`,
 * `getGridPosition`, `findForwardSpace`) reads it rather than building and
 * splitting space names on every step.
 *
 * @param board - Board whose `boardType` selects the grid
 * @returns The shared grid for that size
 */
export function getCoordinateGrid(board: Board): CoordinateGrid {
  // The board's size is the key; every size has exactly one grid.
  const grid = coordinateGridMap[board.boardType];
  return grid;
}
