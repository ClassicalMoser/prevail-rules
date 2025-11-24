import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { filterUndefinedSpaces } from "./filterUndefinedSpaces.js";
import { getAdjacentFacings } from "./getAdjacentFacings.js";
import { getForwardSpace } from "./getForwardSpace.js";

export const getFrontSpaces = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): Set<StandardBoardCoordinate> => {
  // Get adjacent facings and add the facing to get the forward facings
  const adjacentFacings = getAdjacentFacings(facing);
  const forwardFacings = [...adjacentFacings, facing];

  // This error case should remain unreachable if prior validation is correct
  if (forwardFacings.length !== 3) {
    throw new Error(
      `Expected 3 forward facings, but got ${forwardFacings.length}`
    );
  }
  // Array of coordinates and undefined values
  const forwardSpaces = new Set(
    forwardFacings.map((facing) => getForwardSpace(coordinate, facing))
  );

  // Filter out undefined values
  const validForwardSpaces = filterUndefinedSpaces(forwardSpaces);

  // Return set of valid forward spaces
  return validForwardSpaces;
};
