import type { Board, Coordinate } from '@entities';
import { getCoordinateLayout } from '@factories';

/** A space's row and column as positions on its board, counted from 0. */
export interface GridPosition {
  row: number;
  column: number;
}

/**
 * Where a space sits on its board, as row and column positions counted from
 * 0. A coordinate is named row letter then column number (`E-5`), and the
 * board's layout says where each falls. For geometry that is easier counted
 * in rows and columns than walked a step at a time.
 *
 * @param board - The board the space is on
 * @param coordinate - The space
 * @returns Its row and column positions
 * @throws When the coordinate names no row or column of this board
 */
export function getGridPosition(
  board: Board,
  coordinate: Coordinate,
): GridPosition {
  const [rowLetter = '', columnNumber = ''] = coordinate.split('-');
  const layout = getCoordinateLayout(board);
  const row = layout.getRowIndex(rowLetter);
  const column = layout.getColumnIndex(columnNumber);
  // A coordinate that names no row or column of this board is a caller's
  // mistake, not a position.
  if (row === -1 || column === -1) {
    throw new Error(`Invalid coordinate: ${coordinate}`);
  }
  const position: GridPosition = { column, row };
  return position;
}
