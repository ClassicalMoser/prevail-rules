import type { Board, BoardCoordinate } from "@entities";

/**
 * Filter out undefined spaces from a set of space coordinates.
 * @param spaces - The set of space coordinates to filter
 * @returns A set of the space coordinates with undefined values removed
 */
export function filterUndefinedSpaces<T extends BoardCoordinate<Board>>(
  spaces: Set<T | undefined>,
): Set<T> {
  return new Set(
    [...spaces.values()].filter((space) => space !== undefined) as T[],
  );
}
