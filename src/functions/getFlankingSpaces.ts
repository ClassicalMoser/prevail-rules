import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getForwardSpace } from "./getForwardSpace.js";
import { getOrthogonalFacings } from "./getOrthogonalFacings.js";

export const getFlankingSpaces = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): Set<StandardBoardCoordinate> => {
  // Get orthogonal facings to get the flanking directions
  const orthogonalFacings = [...getOrthogonalFacings(facing)];
  // This error case should remain unreachable if prior validation is correct
  if (orthogonalFacings.length !== 2) {
    throw new Error(
      `Expected 2 orthogonal facings, but got ${orthogonalFacings.length}`
    );
  }
  // Array of coordinates and undefined values
  const flankingSpaces = orthogonalFacings.map((facing) =>
    getForwardSpace(coordinate, facing)
  );
  // Filter out undefined values and convert to set
  const validFlankingSpaces: Set<StandardBoardCoordinate> = new Set(
    flankingSpaces.filter((space) => space !== undefined)
  );
  // Return set of valid flanking spaces
  return validFlankingSpaces;
};
