import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { filterUndefinedSpaces } from "./filterUndefinedSpaces.js";
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
  // Set of coordinates and undefined values
  const flankingSpaces = new Set(
    orthogonalFacings.map((facing) => getForwardSpace(coordinate, facing))
  );
  // Filter out undefined values
  const validFlankingSpaces = filterUndefinedSpaces(flankingSpaces);
  // Return set of valid flanking spaces
  return validFlankingSpaces;
};
