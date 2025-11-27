import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";

/**
 * Filter out undefined spaces from a set of space coordinates.
 * @param spaces - The set of space coordinates to filter
 * @returns A set of the space coordinates with undefined values removed
 */
export function filterUndefinedSpaces(
  spaces: Set<BoardCoordinate<Board> | undefined>,
): Set<BoardCoordinate<Board>> {
  return new Set(
    [...spaces.values()].filter(
      (space) => space !== undefined,
    ) as BoardCoordinate<Board>[],
  ) as Set<BoardCoordinate<Board>>;
}
