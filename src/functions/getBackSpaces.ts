import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getFrontSpaces } from "./getFrontSpaces.js";
import { getOppositeFacing } from "./getOppositeFacing.js";

export const getBackSpaces = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): Set<StandardBoardCoordinate> => {
  const oppositeFacing = getOppositeFacing(facing);
  const backSpaces = getFrontSpaces(coordinate, oppositeFacing);
  return backSpaces;
};
