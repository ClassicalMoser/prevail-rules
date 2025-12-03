import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import type { UnitFacing } from "@entities/unit/unitFacing.js";
import { getBackSpaces } from "@functions/boardSpace/adjacency/getBackSpaces.js";
import { getSpacesInDirection } from "@functions/boardSpace/areas/getSpacesInDirection.js";
import { getOppositeFacing } from "@functions/facings/getOppositeFacing.js";

/**
 * Get the spaces behind for a given coordinate and facing.
 * This includes all spaces on the board behind the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces behind for
 * @param facing - The facing to get the spaces behind for
 * @returns A set of the space coordinates
 * (all spaces on the board behind the facing's inline spaces)
 */
export function getSpacesBehind(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing
): Set<BoardCoordinate<Board>> {
  // Start with the back spaces
  const backSpaces = getBackSpaces(board, coordinate, facing);

  // Get the direction backward from the facing
  const backwardFacing = getOppositeFacing(facing);

  // Extend spaces in the backward direction
  return getSpacesInDirection(board, backSpaces, facing, backwardFacing);
}
