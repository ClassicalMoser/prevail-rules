import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import { getRightFacing } from "../facings/getRightFacing.js";
import { getForwardSpace } from "./getForwardSpace.js";

/**
 * Get the right space for a given coordinate and facing.
 * This is the space directly to the right of the given coordinate
 * relative to the given facing direction.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the right space for
 * @param facing - The facing to get the right space for
 * @returns The coordinate of the right space
 * (directly to the right of the given coordinate relative to the facing direction)
 * or undefined if the space is out of bounds
 */
export function getRightSpace(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing
): BoardCoordinate<Board> | undefined {
  // Get the right-facing direction
  const rightFacing = getRightFacing(facing);
  // Get the right space
  const rightSpace = getForwardSpace(board, coordinate, rightFacing);
  return rightSpace;
}

