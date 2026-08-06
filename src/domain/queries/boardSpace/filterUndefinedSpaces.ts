import type { Coordinate } from '@entities';

/**
 * Filter out undefined spaces from a set of space coordinates.
 * @param spaces - The set of space coordinates to filter
 * @returns A set of the space coordinates with undefined values removed
 */
export function filterUndefinedSpaces(
  spaces: Set<Coordinate | undefined>,
): Set<Coordinate> {
  return new Set([...spaces.values()].filter((space) => space !== undefined));
}
