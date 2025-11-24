import type {
  StandardBoardCoordinate,
  UnitFacing,
} from "src/entities/index.js";
import { getBackSpaces } from "./getBackSpaces.js";
import { getForwardSpacesToEdge } from "./getForwardSpacesToEdge.js";
import { getInlineSpaces } from "./getInlineSpaces.js";
import { getOppositeFacing } from "./getOppositeFacing.js";

export const getSpacesBehind = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): Set<StandardBoardCoordinate> => {
  // Start with the back spaces
  const spacesBehind = getBackSpaces(coordinate, facing);

  // Add the inline spaces for all three (prevents checkerboard for diagonal facings)
  for (const space of spacesBehind) {
    const inlineSpaces = getInlineSpaces(space, facing);
    for (const inlineSpace of inlineSpaces) spacesBehind.add(inlineSpace);
  }

  // Get the direction backward from the facing
  const backwardFacing = getOppositeFacing(facing);

  // Add all spaces behind the solid line.
  for (const space of spacesBehind) {
    const spacesToEdge = getForwardSpacesToEdge(space, backwardFacing);
    for (const spaceToEdge of spacesToEdge) spacesBehind.add(spaceToEdge);
  }

  // Filter out undefined values
  const validSpacesBehind = [...spacesBehind.values()].filter(
    (space) => space !== undefined
  ) as StandardBoardCoordinate[];

  // Return set of valid spaces behind
  return new Set(validSpacesBehind);
};
