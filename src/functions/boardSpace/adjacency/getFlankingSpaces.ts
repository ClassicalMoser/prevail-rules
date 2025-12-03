import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import type { UnitFacing } from "@entities/unit/unitFacing.js";
import { filterUndefinedSpaces } from "@functions/boardSpace/filterUndefinedSpaces.js";
import { getForwardSpace } from "@functions/boardSpace/getForwardSpace.js";
import { getOrthogonalFacings } from "@functions/facings/getOrthogonalFacings.js";

/**
 * Get the flanking spaces for a given coordinate and facing,
 * the spaces directly to the right and left of the facing
 * @param board - The board object
 * @param coordinate - The coordinate to get the flanking spaces for
 * @param facing - The facing to get the flanking spaces for
 * @returns A set of the flanking space coordinates (up to 2 spaces, directly to the right and left)
 */
export function getFlankingSpaces(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing,
): Set<BoardCoordinate<Board>> {
  // Get orthogonal facings to get the flanking directions
  const orthogonalFacings = [...getOrthogonalFacings(facing)];
  // Set of coordinates and undefined values
  const flankingSpaces = new Set(
    orthogonalFacings.map((facing) =>
      getForwardSpace(board, coordinate, facing),
    ),
  );
  // Filter out undefined values
  const validFlankingSpaces = filterUndefinedSpaces(flankingSpaces);
  // Return set of valid flanking spaces
  return validFlankingSpaces;
}
