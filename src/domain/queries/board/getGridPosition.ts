import type { Board, Coordinate, GridPosition } from '@entities';
import { findGridPosition } from './findGridPosition';

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
  // Its row and column, read from its whole name, if it is on this board.
  const position = findGridPosition(board, coordinate);

  // A coordinate that names no space of this board is a caller's mistake,
  // not a position.
  if (position === undefined) {
    throw new Error(`Invalid coordinate: ${coordinate}`);
  }

  // Its place on the board, for counting spaces apart.
  return position;
}
