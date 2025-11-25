import type { StandardBoardCoordinate } from "src/entities/index.js";

/**
 * Filter out undefined spaces from a set of space coordinates.
 * @param spaces - The set of space coordinates to filter
 * @returns A set of the space coordinates with undefined values removed
 */
export const filterUndefinedSpaces = (
  spaces: Set<StandardBoardCoordinate | undefined>,
): Set<StandardBoardCoordinate> => {
  return new Set(
    [...spaces.values()].filter(
      (space) => space !== undefined,
    ) as StandardBoardCoordinate[],
  ) as Set<StandardBoardCoordinate>;
};
