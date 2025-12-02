import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getFrontSpaces } from "../adjacency/getFrontSpaces.js";
import { getSpacesInDirection } from "./getSpacesInDirection.js";

/**
 * Get the spaces ahead for a given coordinate and facing.
 * This includes all spaces on the board in front of the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces ahead for
 * @param facing - The facing to get the spaces ahead for
 * @returns A set of the space coordinates
 * (all spaces on the board in front of the facing's inline spaces)
 */
export function getSpacesAhead(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing,
): Set<BoardCoordinate<Board>> {
  // Start with the front spaces
  const frontSpaces = getFrontSpaces(board, coordinate, facing);

  // Extend spaces in the forward direction
  return getSpacesInDirection(board, frontSpaces, facing, facing);
}
