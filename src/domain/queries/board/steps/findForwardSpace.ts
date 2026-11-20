import type { Board, UnitFacing, Coordinate } from '@entities';
import { unitFacings } from '@entities';
import { getColumnDelta, getRowDelta } from '../deltas';
import { getCoordinateGrid, getCoordinateLayout } from '@factories';

const facings = new Set<UnitFacing>(unitFacings);

/**
 * Words why a coordinate is not a space on this board: a name not shaped
 * row-column, a row this size lacks, or a column it lacks.
 *
 * @param board - The board the coordinate was asked of
 * @param coordinate - The coordinate the grid does not hold
 * @throws Always, naming the part that is wrong
 */
function throwInvalidCoordinate(board: Board, coordinate: Coordinate): never {
  // Coordinates are formatted as "Row-Column" (e.g., "E-5" = row E, column 5)
  const parts = coordinate.split('-');
  if (parts.length !== 2) {
    throw new Error(`Invalid coordinate: ${coordinate}`);
  }
  const [inputRow = '', inputColumn = ''] = parts;

  // A row or a column only a larger board has.
  const layout = getCoordinateLayout(board);
  if (layout.getRowIndex(inputRow) === -1) {
    throw new Error(`Invalid row: ${inputRow}`);
  }
  if (layout.getColumnIndex(inputColumn) === -1) {
    throw new Error(`Invalid column: ${inputColumn}`);
  }

  // Both parts are this board's, so the grid holds the space; reaching here
  // means the grid and the layout disagree.
  throw new Error(`Invalid coordinate: ${coordinate}`);
}

/**
 * One step forward from `coordinate` along `facing`, using the grid for the
 * active board’s size (`board.boardType`).
 *
 * Returns `undefined` when that step would leave the board. Throws on a malformed
 * coordinate string, a row/column outside this board’s layout, or an invalid facing.
 */
export function findForwardSpace(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Coordinate | undefined {
  // The grid for this size tables each space's row and column, so a step
  // costs two lookups rather than splitting the name and naming the next
  // space afresh. A mover's paths and a bot's weighing take many steps.
  const grid = getCoordinateGrid(board);
  const currentRowIndex = grid.rowIndexByCoordinate.get(coordinate);
  const currentColumnIndex = grid.columnIndexByCoordinate.get(coordinate);

  // A space not on this board is a caller's mistake. Say which part of its
  // name is wrong, as the step always has.
  if (currentRowIndex === undefined || currentColumnIndex === undefined) {
    throwInvalidCoordinate(board, coordinate);
  }

  // Validate facing (defensive check for invalid facings that bypass TypeScript)
  if (!facings.has(facing)) {
    throw new Error(`Invalid facing: ${facing}`);
  }

  // Calculate the new position by applying the movement deltas
  const newRowIndex = currentRowIndex + getRowDelta(facing);
  const newColumnIndex = currentColumnIndex + getColumnDelta(facing);

  // A step past the last row or column leaves the board: there is no space
  // there, which is an ordinary answer (a board edge at a unit's front).
  const forwardSpace = grid.coordinateRows[newRowIndex]?.[newColumnIndex];
  return forwardSpace;
}
