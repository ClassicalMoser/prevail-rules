import type { Board, Coordinate } from '@entities';
import { getCoordinateLayout } from '@factories';

/** A space's row and column as positions on its board, counted from 0. */
interface GridPosition {
  row: number;
  column: number;
}

/**
 * Where a space sits on its board, as row and column positions. A coordinate
 * is named row letter then column number (`E-5`), and the board's layout
 * says where each falls.
 */
function gridPosition(board: Board, coordinate: Coordinate): GridPosition {
  const layout = getCoordinateLayout(board);
  const [row = '', column = ''] = coordinate.split('-');
  const position: GridPosition = {
    column: layout.getColumnIndex(column),
    row: layout.getRowIndex(row),
  };
  return position;
}

/**
 * How many spaces apart two spaces are, counting a diagonal step as one. A
 * unit steps into any of the eight spaces around it (§2.4), so this is the
 * fewest steps between the two on an open board: the bot's sense of how
 * near the enemy is, not a path a unit can take.
 *
 * @param board - The board both spaces are on
 * @param from - One space
 * @param to - The other
 * @returns The number of steps between them on open ground
 */
export function boardDistance(
  board: Board,
  from: Coordinate,
  to: Coordinate,
): number {
  const a = gridPosition(board, from);
  const b = gridPosition(board, to);
  // With diagonals allowed, the longer of the two gaps is the step count.
  const distance = Math.max(
    Math.abs(a.row - b.row),
    Math.abs(a.column - b.column),
  );
  return distance;
}

/**
 * How squarely a unit standing on `from` and looking at `ahead`, the space
 * one step the way it faces, looks toward `to`. Used to reward ending a move
 * turned toward the enemy: a unit strikes and is safely struck only from the
 * front.
 *
 * @param board - The board the spaces are on
 * @param from - Where the unit stands
 * @param ahead - The space one step the way it faces
 * @param to - The space it should be looking toward
 * @returns From -1 (looking directly away) to 1 (looking directly at it)
 */
export function facingAlignment(
  board: Board,
  from: Coordinate,
  ahead: Coordinate,
  to: Coordinate,
): number {
  const a = gridPosition(board, from);
  const forward = gridPosition(board, ahead);
  const b = gridPosition(board, to);
  const rowStep = forward.row - a.row;
  const columnStep = forward.column - a.column;
  const rowGap = b.row - a.row;
  const columnGap = b.column - a.column;
  const gapLength = Math.hypot(rowGap, columnGap);
  const stepLength = Math.hypot(rowStep, columnStep);
  // Standing on the target faces nothing in particular.
  if (gapLength === 0 || stepLength === 0) {
    return 0;
  }
  // The cosine between the way it faces and the way to the target.
  const alignment =
    (rowGap * rowStep + columnGap * columnStep) / (gapLength * stepLength);
  return alignment;
}
