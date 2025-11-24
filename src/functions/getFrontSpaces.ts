import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getAdjacentFacings } from "./getAdjacentFacings.js";
import { getForwardSpace } from "./getForwardSpace.js";

export const getFrontSpaces = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): StandardBoardCoordinate[] => {
  const adjacentFacings = getAdjacentFacings(facing);
  const forwardFacings = [...adjacentFacings, facing];
  const forwardSpaces = forwardFacings.map((facing) =>
    getForwardSpace(coordinate, facing)
  );
  if (forwardSpaces.length !== 3) {
    throw new Error(
      `Expected 3 forward spaces, but got ${forwardSpaces.length}`
    );
  }
  const validForwardSpaces = forwardSpaces.filter(
    (space) => space !== undefined
  );
  return validForwardSpaces;
};
