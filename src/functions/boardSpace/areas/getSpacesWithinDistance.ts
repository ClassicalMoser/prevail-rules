import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import { getAdjacentSpaces } from "../adjacency/getAdjacentSpaces.js";

/**
 * Get all spaces within a given distance from a coordinate.
 * Uses breadth-first traversal to find all spaces within the distance.
 * @param board - The board object
 * @param coordinate - The starting coordinate
 * @param distance - The maximum distance (inclusive)
 * @returns A set of all space coordinates within the distance
 */
export function getSpacesWithinDistance(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  distance: number
): Set<BoardCoordinate<Board>> {
  // If distance is 0 or negative, return only the starting coordinate
  if (distance <= 0) {
    return new Set([coordinate]);
  }

  // Set to track all spaces within distance
  const spacesWithinDistance = new Set<BoardCoordinate<Board>>([coordinate]);
  // Set to track spaces at the current distance level
  let currentLevel = new Set<BoardCoordinate<Board>>([coordinate]);

  // Iterate through each distance level
  for (
    let currentDistance = 1;
    currentDistance <= distance;
    currentDistance++
  ) {
    // Set to track spaces at the next distance level
    const nextLevel = new Set<BoardCoordinate<Board>>();

    // For each space at the current level, get its adjacent spaces
    for (const space of currentLevel) {
      const adjacentSpaces = getAdjacentSpaces(board, space);
      for (const adjacentSpace of adjacentSpaces) {
        // Only add if we haven't seen this space before
        if (!spacesWithinDistance.has(adjacentSpace)) {
          spacesWithinDistance.add(adjacentSpace);
          nextLevel.add(adjacentSpace);
        }
      }
    }

    // Move to the next level
    currentLevel = nextLevel;
  }

  return spacesWithinDistance;
}
