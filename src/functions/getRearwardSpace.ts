import type { Board, BoardCoordinate } from "../entities/board/board.js";
import type { UnitFacing } from "../entities/unit/unitFacing.js";
import { getOppositeFacing } from "./facings/getOppositeFacing.js";
import { getForwardSpace } from "./getForwardSpace.js";

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
