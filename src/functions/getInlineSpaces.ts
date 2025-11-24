import type {
  StandardBoardCoordinate,
  UnitFacing,
} from "src/entities/index.js";
import { getForwardSpacesToEdge } from "./getForwardSpacesToEdge.js";
import { getOrthogonalFacings } from "./getOrthogonalFacings.js";

export const getInlineSpaces = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): Set<StandardBoardCoordinate> => {
  // Initialize set with the starting coordinate
  const inlineSpaces: Set<StandardBoardCoordinate> = new Set([coordinate]);

  // Get the two orthogonal facings (directions perpendicular to the facing)
  const orthogonalFacings = [...getOrthogonalFacings(facing)];

  // Get the forward spaces to the edge for each orthogonal facing
  for (const orthogonalFacing of orthogonalFacings) {
    const spaces = getForwardSpacesToEdge(coordinate, orthogonalFacing);
    for (const space of spaces) inlineSpaces.add(space);
  }

  // Filter out undefined values
  const validInlineSpaces = [...inlineSpaces.values()].filter(
    (space) => space !== undefined
  ) as StandardBoardCoordinate[];

  // Return set of valid inline spaces
  return new Set(validInlineSpaces);
};
