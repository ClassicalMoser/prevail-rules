import type { Board, BoardCoordinate } from "../../entities/board/board.js";
import { unitFacings } from "src/entities/index.js";
import { filterUndefinedSpaces } from "../filterUndefinedSpaces.js";
import { getForwardSpace } from "../getForwardSpace.js";

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
