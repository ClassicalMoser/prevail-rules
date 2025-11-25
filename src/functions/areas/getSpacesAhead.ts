import type {
  StandardBoardCoordinate,
  UnitFacing,
} from "src/entities/index.js";
import { getFrontSpaces } from "../adjacency/getFrontSpaces.js";
import { filterUndefinedSpaces } from "../filterUndefinedSpaces.js";
import { getForwardSpacesToEdge } from "../getForwardSpacesToEdge.js";
import { getInlineSpaces } from "./getInlineSpaces.js";

/**
 * Get the spaces ahead for a given coordinate and facing.
 * This includes all spaces on the board in front of the facing's inline spaces.
 * @param coordinate - The coordinate to get the spaces ahead for
 * @param facing - The facing to get the spaces ahead for
 * @returns A set of the space coordinates
 * (all spaces on the board in front of the facing's inline spaces)
 */
export const getSpacesAhead = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): Set<StandardBoardCoordinate> => {
  // Start with the front spaces
  const spacesAhead = getFrontSpaces(coordinate, facing);

  // Add the inline spaces for all three (prevents checkerboard for diagonal facings)
  for (const space of spacesAhead) {
    const inlineSpaces = getInlineSpaces(space, facing);
    for (const inlineSpace of inlineSpaces) spacesAhead.add(inlineSpace);
  }

  // Get the rest of the spaces ahead
  for (const space of spacesAhead) {
    const spacesToEdge = getForwardSpacesToEdge(space, facing);
    for (const spaceToEdge of spacesToEdge) spacesAhead.add(spaceToEdge);
  }

  // Filter out undefined values
  const validSpacesAhead = filterUndefinedSpaces(spacesAhead);

  // Return set of valid spaces ahead
  return validSpacesAhead;
};
