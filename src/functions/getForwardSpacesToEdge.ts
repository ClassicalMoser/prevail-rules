import type {
  StandardBoardCoordinate,
  UnitFacing,
} from "src/entities/index.js";
import { getForwardSpace } from "./getForwardSpace.js";

export const getForwardSpacesToEdge = (
  coordinate: StandardBoardCoordinate,
  facing: UnitFacing
): Set<StandardBoardCoordinate> => {
  // Initialize set with the starting coordinate
  const spaces: Set<StandardBoardCoordinate> = new Set([coordinate]);
  // Iterate until the current space is undefined
  let currentSpace: StandardBoardCoordinate | undefined = coordinate;
  while (currentSpace !== undefined) {
    // Get the next space
    const nextSpace = getForwardSpace(currentSpace, facing);
    // If the next space is not undefined, add it to the set
    if (nextSpace !== undefined) {
      spaces.add(nextSpace);
      // Update the current space
      currentSpace = nextSpace;
    } else {
      // Break the loop if the next space is undefined
      break;
    }
  }
  // Filter out undefined values and the starting coordinate
  const validSpaces = [...spaces.values()].filter(
    (space) => space !== undefined && space !== coordinate
  ) as StandardBoardCoordinate[];
  // Return set of valid forward spaces to the edge
  return new Set(validSpaces);
};
