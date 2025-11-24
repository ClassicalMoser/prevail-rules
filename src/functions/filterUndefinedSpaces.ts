import type { StandardBoardCoordinate } from "src/entities/index.js";

export const filterUndefinedSpaces = (
  spaces: Set<StandardBoardCoordinate | undefined>
): Set<StandardBoardCoordinate> => {
  return new Set(
    [...spaces.values()].filter(
      (space) => space !== undefined
    ) as StandardBoardCoordinate[]
  ) as Set<StandardBoardCoordinate>;
};
