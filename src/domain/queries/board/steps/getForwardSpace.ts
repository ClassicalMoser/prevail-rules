import type { Board, UnitFacing, Coordinate } from '@entities';
import { getCoordinateLayout, unitFacings } from '@entities';
import { getColumnDelta, getRowDelta } from '../deltas';

const facings = new Set<UnitFacing>(unitFacings);

/**
 * One step forward from `coordinate` along `facing`, using the active board’s
 * coordinate layout (`board.boardType`).
 *
 * Returns `undefined` when that step would leave the board. Throws on a malformed
 * coordinate string, a row/column outside this board’s layout, or an invalid facing.
 */
export function getForwardSpace(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Coordinate | undefined {
  const parts = coordinate.split('-');
  if (parts.length !== 2) {
    throw new Error(`Invalid coordinate: ${coordinate}`);
  }
  // Parse coordinate - already validated at boundary, so we trust the format
  // Coordinates are formatted as "Row-Column" (e.g., "E-5" = row E, column 5)
  const [inputRow, inputColumn] = parts;

  // Get the coordinate layout for the board
  const layout = getCoordinateLayout(board);

  // Convert string coordinates to array indices (O(1) via prebuilt maps)
  const currentRowIndex = layout.getRowIndex(inputRow);
  const currentColumnIndex = layout.getColumnIndex(inputColumn);

  // Validate row and column (defensive check for invalid coordinates that bypass TypeScript)
  if (currentRowIndex === -1) {
    throw new Error(`Invalid row: ${inputRow}`);
  }
  if (currentColumnIndex === -1) {
    throw new Error(`Invalid column: ${inputColumn}`);
  }

  // Validate facing (defensive check for invalid facings that bypass TypeScript)
  if (!facings.has(facing)) {
    throw new Error(`Invalid facing: ${facing}`);
  }

  // Calculate the new position by applying the movement deltas
  const newRowIndex = currentRowIndex + getRowDelta(facing);
  const newColumnIndex = currentColumnIndex + getColumnDelta(facing);

  // Boundary check
  if (
    newRowIndex < 0 ||
    newRowIndex >= layout.rowLetters.length ||
    newColumnIndex < 0 ||
    newColumnIndex >= layout.columnNumbers.length
  ) {
    return undefined;
  }

  // Convert the calculated indices back to string coordinates
  const newRow = layout.rowLetters[newRowIndex];
  const newColumn = layout.columnNumbers[newColumnIndex];

  // Reconstruct the coordinate string
  return layout.createCoordinate(newRow, newColumn);
}
