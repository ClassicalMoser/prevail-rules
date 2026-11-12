import type { Board, Coordinate } from '@entities';
import { getGridPosition } from '@queries';

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
  const a = getGridPosition(board, from);
  const forward = getGridPosition(board, ahead);
  const b = getGridPosition(board, to);
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
