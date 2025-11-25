import type {
  StandardBoardCoordinate,
  UnitFacing,
} from "src/entities/index.js";
import { getOrthogonalFacings } from "../facings/getOrthogonalFacings.js";
import { filterUndefinedSpaces } from "../filterUndefinedSpaces.js";
import { getForwardSpacesToEdge } from "../getForwardSpacesToEdge.js";

/**
 * Get the inline spaces for a given coordinate and facing,
 * continuing in a straight line to the left and right of the facing.
 * This includes the origin space.
 * @param coordinate - The coordinate to get the inline spaces for
 * @param facing - The facing to get the inline spaces for
 * @returns A set of the inline space coordinates
 * (unlimited, straight line to the left and right, including the origin space)
 */
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
  const validInlineSpaces = filterUndefinedSpaces(inlineSpaces);

  // Return set of valid inline spaces
  return validInlineSpaces;
};
