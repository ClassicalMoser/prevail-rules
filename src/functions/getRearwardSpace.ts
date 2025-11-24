import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getForwardSpace } from "./getForwardSpace.js";
import { getOppositeFacing } from "./getOppositeFacing.js";

export const getRearwardSpace = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): StandardBoardCoordinate | undefined => {
  // Get the opposite facing
  const oppositeFacing = getOppositeFacing(facing);
  // Get the rearward space
  const rearwardSpace = getForwardSpace(coordinate, oppositeFacing);
  // Return the rearward space
  return rearwardSpace;
};
