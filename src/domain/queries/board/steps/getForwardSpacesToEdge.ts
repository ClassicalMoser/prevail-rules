import type { Board, Coordinate, UnitFacing } from '@entities';
import { getForwardSpace } from './getForwardSpace';

/**
 * Get the forward spaces to the edge for a given coordinate and facing.
 * This includes all spaces on the board in a direct line from the given coordinate in the given facing direction.
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
  let currentSpace: Coordinate | undefined = getForwardSpace(
    board,
    coordinate,
    facing,
  );
  // Iterate until the current space is undefined
  while (currentSpace !== undefined) {
    // If the next space is not undefined, add it to the set
    spaces.add(currentSpace);
    // Update the current space
    currentSpace = getForwardSpace(board, currentSpace, facing);
  }
  // Return set of valid forward spaces to the edge
  return spaces;
}
