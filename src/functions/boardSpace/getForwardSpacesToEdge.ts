import type { Board, BoardCoordinate, UnitFacing } from "@entities";
import { filterUndefinedSpaces, getForwardSpace } from "@functions";

/**
 * Get the forward spaces to the edge for a given coordinate and facing.
 * This includes all spaces on the board ina direct line from the given coordinate in the given facing direction.
 * @param board - The board object (used to infer coordinate type)
 * @param coordinate - The coordinate to get the forward spaces to the edge for
 * @param facing - The facing to get the forward spaces to the edge for
 * @returns A set of the space coordinates
 * (all spaces on the board in a direct line from the given coordinate in the given facing direction)
 */
export function getForwardSpacesToEdge<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing,
): Set<BoardCoordinate<TBoard>> {
  // Initialize set with the starting coordinate
  const spaces: Set<BoardCoordinate<TBoard>> = new Set([coordinate]);
  // Iterate until the current space is undefined
  let currentSpace: BoardCoordinate<TBoard> | undefined = coordinate;
  while (currentSpace !== undefined) {
    // Get the next space
    const nextSpace: BoardCoordinate<TBoard> | undefined = getForwardSpace(
      board,
      currentSpace,
      facing,
    );
    // If the next space is not undefined, add it to the set
    if (nextSpace !== undefined) {
      spaces.add(nextSpace);
      // Update the current space
      currentSpace = nextSpace;
    } else {
      // Break the loop if the next space is undefined
      break;
    }
  }
  // Remove the starting coordinate
  spaces.delete(coordinate);
  // Filter out undefined values
  const validSpaces = filterUndefinedSpaces(spaces);
  // Return set of valid forward spaces to the edge
  return validSpaces;
}
