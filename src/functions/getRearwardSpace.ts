import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getForwardSpace } from "./getForwardSpace.js";
import { getOppositeFacing } from "./getOppositeFacing.js";

export const getRearwardSpace = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): StandardBoardCoordinate | undefined => {
  const oppositeFacing = getOppositeFacing(facing);
  const rearwardSpace = getForwardSpace(coordinate, oppositeFacing);
  return rearwardSpace;
};
