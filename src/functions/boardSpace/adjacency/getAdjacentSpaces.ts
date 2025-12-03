import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import { unitFacings } from "@entities/index.js";
import { filterUndefinedSpaces } from "@functions/boardSpace/filterUndefinedSpaces.js";
import { getForwardSpace } from "@functions/boardSpace/getForwardSpace.js";

/**
 * Get the adjacent spaces for a given coordinate.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the adjacent spaces for
 * @returns A set of the adjacent space coordinates (up to 8 spaces)
 */
export function getAdjacentSpaces(
  board: Board,
  coordinate: BoardCoordinate<Board>
): Set<BoardCoordinate<Board>> {
  // One space in each of the eight directions from the given coordinate
  const adjacentSpaces = new Set(
    unitFacings.map((facing) => getForwardSpace(board, coordinate, facing))
  ) as Set<BoardCoordinate<Board> | undefined>;

  // Filter out undefined values
  const validAdjacentSpaces = filterUndefinedSpaces(adjacentSpaces);

  // Return set of valid adjacent spaces
  return new Set(validAdjacentSpaces) as Set<BoardCoordinate<Board>>;
}
