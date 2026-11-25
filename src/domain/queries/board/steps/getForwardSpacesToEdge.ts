import type { Board, Coordinate, UnitFacing } from '@entities';
import { findForwardSpace } from './findForwardSpace';

/**
 * Get the forward spaces to the edge for a given coordinate and facing.
 * This includes all spaces on the board in a direct line from the given coordinate in the given facing direction.
 *
 * A straight run to the edge: a line is looked for along it, rank-wise to
 * each side of a unit (§4.3.5, `getLineSegmentContainingUnit`), and the
 * half-planes ahead and behind are filled out with it (§2.3.3).
 *
 * TODO(misleading): the board is not used to infer a coordinate type; it is
 * the size whose edge ends the run. Settle the `@param board` wording.
 *
 * TODO(composition): `getLineSegmentContainingUnit` stops at the first gap,
 * yet the whole run to the edge is built first. Settle whether the line walk
 * steps with `findForwardSpace` instead.
 * @param board - The board object (used to infer coordinate type)
 * @param coordinate - The coordinate to get the forward spaces to the edge for
 * @param facing - The facing to get the forward spaces to the edge for
 * @returns A set of the space coordinates
 * (all spaces on the board in a direct line from the given coordinate in the given facing direction)
 */
export function getForwardSpacesToEdge(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  const spaces = new Set<Coordinate>();
  // Get the next space
  let currentSpace: Coordinate | undefined = findForwardSpace(
    board,
    coordinate,
    facing,
  );
  // Iterate until the current space is undefined
  while (currentSpace !== undefined) {
    // If the next space is not undefined, add it to the set
    spaces.add(currentSpace);
    // Update the current space
    currentSpace = findForwardSpace(board, currentSpace, facing);
  }
  // Return set of valid forward spaces to the edge
  return spaces;
}
