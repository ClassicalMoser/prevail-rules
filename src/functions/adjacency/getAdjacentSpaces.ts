import type { StandardBoardCoordinate } from "src/entities/index.js";
import { unitFacings } from "src/entities/index.js";
import { filterUndefinedSpaces } from "../filterUndefinedSpaces.js";
import { getForwardSpace } from "../getForwardSpace.js";

/**
 * Get the adjacent spaces for a given coordinate
 * @param coordinate - The coordinate to get the adjacent spaces for
 * @returns A set of the adjacent space coordinates (up to 8 spaces)
 */
export const getAdjacentSpaces = (
  coordinate: StandardBoardCoordinate
): Set<StandardBoardCoordinate> => {
  // One space in each of the eight directions from the given coordinate
  const adjacentSpaces = new Set(
    unitFacings.map((facing) => getForwardSpace(coordinate, facing))
  ) as Set<StandardBoardCoordinate | undefined>;
  // Filter out undefined values
  const validAdjacentSpaces = filterUndefinedSpaces(adjacentSpaces);
  // Return set of valid adjacent spaces
  return new Set(validAdjacentSpaces);
};
