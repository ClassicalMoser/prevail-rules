import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getForwardSpace } from "./getForwardSpace.js";
import { getOrthogonalFacings } from "./getOrthogonalFacings.js";

export const getFlankingSpaces = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): StandardBoardCoordinate[] => {
  const orthogonalFacings = getOrthogonalFacings(facing);
  const flankingSpaces = orthogonalFacings.map((facing) =>
    getForwardSpace(coordinate, facing)
  );
  if (flankingSpaces.length !== 2) {
    throw new Error(
      `Expected 2 flanking spaces, but got ${flankingSpaces.length}`
    );
  }
  const validFlankingSpaces = flankingSpaces.filter(
    (space) => space !== undefined
  );
  return validFlankingSpaces;
};
