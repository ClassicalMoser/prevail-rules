import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
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
  const forwardSpaces = forwardFacings.map((facing) =>
    getForwardSpace(coordinate, facing)
  );
  // Filter out undefined values and convert to set
  const validForwardSpaces: Set<StandardBoardCoordinate> = new Set(
    forwardSpaces.filter((space) => space !== undefined)
  );
  // Return set of valid forward spaces
  return validForwardSpaces;
};
