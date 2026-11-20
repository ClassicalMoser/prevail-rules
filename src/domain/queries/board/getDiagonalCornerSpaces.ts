import type { Board, Coordinate } from '@entities';
import { throwIfUndefined } from '@utils';
import { findCoordinateAtPosition } from './findCoordinateAtPosition';
import { getGridPosition } from './getGridPosition';

/**
 * The two spaces a diagonal step cuts between: the orthogonal neighbours that
 * the origin and the target share, one at each corner of the step.
 *
 * Both diagonal rules are about these two spaces. Enemies in both block the
 * diagonal for support and commanders (§2.4.4, `diagonalIsClear`), and a
 * mover must be able to pass through one of them (§5.4.5,
 * `checkDiagonalMove`).
 *
 * @param board - The board both spaces are on
 * @param originCoordinate - The space the diagonal starts from
 * @param targetCoordinate - The diagonally adjacent space it reaches
 * @returns The two corner spaces, in no particular order
 * @throws When either space is not on this board, or the target is not
 * diagonally adjacent to the origin
 */
export function getDiagonalCornerSpaces(
  board: Board,
  originCoordinate: Coordinate,
  targetCoordinate: Coordinate,
): readonly [Coordinate, Coordinate] {
  // Where each end of the step sits.
  const origin = getGridPosition(board, originCoordinate);
  const target = getGridPosition(board, targetCoordinate);

  // A diagonal neighbour is one row and one column away. Anything else has no
  // corners to cut between, and asking is the caller's mistake.
  const isDiagonalNeighbour =
    Math.abs(target.row - origin.row) === 1 &&
    Math.abs(target.column - origin.column) === 1;
  if (!isDiagonalNeighbour) {
    throw new Error(
      `Target space ${targetCoordinate} is not diagonally adjacent to ${originCoordinate}`,
    );
  }

  // One corner shares the origin's row and the target's column, the other the
  // target's row and the origin's column. Both ends are on the board, so both
  // corners are too: a missing one is a fault in the layout, not an edge.
  const besideOrigin = throwIfUndefined(
    findCoordinateAtPosition(board, { column: target.column, row: origin.row }),
    `No corner space beside ${originCoordinate} toward ${targetCoordinate}`,
  );
  const besideTarget = throwIfUndefined(
    findCoordinateAtPosition(board, { column: origin.column, row: target.row }),
    `No corner space beside ${targetCoordinate} toward ${originCoordinate}`,
  );

  // The two spaces the step passes between.
  const corners: readonly [Coordinate, Coordinate] = [
    besideOrigin,
    besideTarget,
  ];
  return corners;
}
