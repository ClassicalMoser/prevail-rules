import type { StandardBoardCoordinate } from "src/entities/index.js";
import { unitFacings } from "src/entities/index.js";
import { getForwardSpace } from "./getForwardSpace.js";

export const getAdjacentSpaces = (
  coordinate: StandardBoardCoordinate
): Set<StandardBoardCoordinate> => {
  // One space in each of the eight directions from the given coordinate
  const adjacentSpaces = unitFacings.map((facing) =>
    getForwardSpace(coordinate, facing)
  );
  // Filter out undefined values
  const validAdjacentSpaces = adjacentSpaces.filter(
    (space) => space !== undefined
  ) as StandardBoardCoordinate[];
  // Return set of valid adjacent spaces
  return new Set(validAdjacentSpaces);
};
