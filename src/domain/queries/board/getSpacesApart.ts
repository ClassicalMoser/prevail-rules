import type { Board, Coordinate } from '@entities';
import { getGridPosition } from './getGridPosition';

/**
 * How many spaces apart two spaces are, counting a diagonal step as one: the
 * longer of the row gap and the column gap. Every space has eight neighbours
 * (§2.4), so this is how far one space is from another on the board, as an
 * inspiration range counts it from the commander (§4.2.7). It is distance
 * only, not a path: it ignores what stands between.
 *
 * Asking whether a unit is "within N spaces" this way is arithmetic on two
 * coordinates, where {@link getSpacesWithinDistance} spreads out ring by ring
 * to list every space in reach.
 *
 * @param board - The board both spaces are on
 * @param from - One space
 * @param to - The other
 * @returns The number of spaces between them, 0 for the same space
 * @throws When either coordinate is not on the board
 */
export function getSpacesApart(
  board: Board,
  from: Coordinate,
  to: Coordinate,
): number {
  const a = getGridPosition(board, from);
  const b = getGridPosition(board, to);
  // A diagonal step closes a row and a column at once, so the longer gap
  // is the count.
  const spacesApart = Math.max(
    Math.abs(a.row - b.row),
    Math.abs(a.column - b.column),
  );
  return spacesApart;
}
