import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getOrthogonalFacings } from "../../facings/getOrthogonalFacings.js";
import { filterUndefinedSpaces } from "../filterUndefinedSpaces.js";
import { getForwardSpace } from "../getForwardSpace.js";

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
