import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import type { UnitFacing } from "@entities/unit/unitFacing.js";
import { getForwardSpace } from "@functions/boardSpace/getForwardSpace.js";
import { getOppositeFacing } from "@functions/facings/getOppositeFacing.js";

/**
 * Get the rearward space for a given coordinate and facing.
 * This is the space directly behind the given coordinate in the given facing direction.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the rearward space for
 * @param facing - The facing to get the rearward space for
 * @returns The coordinate of the rearward space
 * (directly behind the given coordinate in the given facing direction)
 * or undefined if the space is out of bounds
 */
export function getRearwardSpace(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing,
): BoardCoordinate<Board> | undefined {
  // Get the opposite facing
  const oppositeFacing = getOppositeFacing(facing);
  // Get the rearward space
  const rearwardSpace = getForwardSpace(board, coordinate, oppositeFacing);
  return rearwardSpace;
}
