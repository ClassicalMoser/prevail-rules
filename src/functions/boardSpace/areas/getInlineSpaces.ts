import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import type { UnitFacing } from "@entities/unit/unitFacing.js";
import { filterUndefinedSpaces } from "@functions/boardSpace/filterUndefinedSpaces.js";
import { getForwardSpacesToEdge } from "@functions/boardSpace/getForwardSpacesToEdge.js";
import { getOrthogonalFacings } from "@functions/facings/getOrthogonalFacings.js";

/**
 * Get the inline spaces for a given coordinate and facing,
 * continuing in a straight line to the left and right of the facing.
 * This includes the origin space.
 * @param board - The board object
 * @param coordinate - The coordinate to get the inline spaces for
 * @param facing - The facing to get the inline spaces for
 * @returns A set of the inline space coordinates
 * (unlimited, straight line to the left and right, including the origin space)
 */
export function getInlineSpaces(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing,
): Set<BoardCoordinate<Board>> {
  // Initialize set with the starting coordinate
  const inlineSpaces: Set<BoardCoordinate<Board>> = new Set([coordinate]);

  // Get the two orthogonal facings (directions perpendicular to the facing)
  const orthogonalFacings = [...getOrthogonalFacings(facing)];

  // Get the forward spaces to the edge for each orthogonal facing
  for (const orthogonalFacing of orthogonalFacings) {
    const spaces = getForwardSpacesToEdge(board, coordinate, orthogonalFacing);
    for (const space of spaces) inlineSpaces.add(space);
  }

  // Filter out undefined values
  const validInlineSpaces = filterUndefinedSpaces(inlineSpaces);

  // Return set of valid inline spaces
  return validInlineSpaces;
}
