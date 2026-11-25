import type { Board } from '@entities';
import type { Coordinate } from '@ruleValues';
import { getAdjacentSpaces } from '../adjacency';

/**
 * Get all spaces within a given distance from a coordinate.
 * Uses breadth-first traversal to find all spaces within the distance.
 *
 * TODO(composition): nothing in this repository calls this but a spec;
 * `getSpacesApart` answers "within N spaces" (§2.4.2) by arithmetic instead.
 * Settle whether it goes or stays as API for the packages built on these
 * rules.
 *
 * @param board - The board object
 * @param coordinate - The starting coordinate
 * @param distance - The maximum distance (inclusive)
 * @returns A set of all space coordinates within the distance
 */
export function getSpacesWithinDistance(
  board: Board,
  coordinate: Coordinate,
  distance: number,
): Set<Coordinate> {
  // If distance is less than 0, return an empty set.
  if (distance < 0) {
    // Nothing is fewer than no steps away.
    return new Set();
  }
  // If distance is exactly 0, return only the starting coordinate
  // The loop below would answer the same, so a mutant dropping this check
  // is equivalent.
  if (distance === 0) {
    // "Within 0 spaces" is the same space (§2.4.2).
    return new Set([coordinate]);
  }

  // Set to track all spaces within distance
  const spacesWithinDistance = new Set<Coordinate>([coordinate]);
  // Set to track spaces at the current distance level
  let currentLevel = new Set<Coordinate>([coordinate]);

  // Iterate through each distance level
  for (
    let currentDistance = 1;
    currentDistance <= distance;
    currentDistance++
  ) {
    // Set to track spaces at the next distance level
    const nextLevel = new Set<Coordinate>();

    // For each space at the current level, get its adjacent spaces
    for (const space of currentLevel) {
      const adjacentSpaces = getAdjacentSpaces(board, space);
      for (const adjacentSpace of adjacentSpaces) {
        // Only add if we haven't seen this space before
        // A set keeps each space once anyway; the check only keeps a ring
        // from being walked out again, so a mutant removing it is equivalent.
        if (!spacesWithinDistance.has(adjacentSpace)) {
          spacesWithinDistance.add(adjacentSpace);
          nextLevel.add(adjacentSpace);
        }
      }
    }

    // Move to the next level
    currentLevel = nextLevel;
  }

  // The start and every space within that many steps, a diagonal counting
  // as one, cut short by the board edge.
  return spacesWithinDistance;
}
