import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getOppositeFacing } from "../facings/getOppositeFacing.js";
import { getFrontSpaces } from "./getFrontSpaces.js";

/**
 * Get the back spaces for a given coordinate and facing, including diagonals
 * @param coordinate - The coordinate to get the back spaces for
 * @param facing - The facing to get the back spaces for
 * @returns A set of the back space coordinates (up to 3 spaces, including diagonals)
 */
export const getBackSpaces = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): Set<StandardBoardCoordinate> => {
  const oppositeFacing = getOppositeFacing(facing);
  const backSpaces = getFrontSpaces(coordinate, oppositeFacing);
  return backSpaces;
};
