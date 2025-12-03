import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import type { UnitFacing } from "@entities/unit/unitFacing.js";
import { getFrontSpaces } from "@functions/boardSpace/adjacency/getFrontSpaces.js";
import { getOppositeFacing } from "@functions/facings/getOppositeFacing.js";

/**
 * Get the back spaces for a given coordinate and facing, including diagonals
 * @param board - The board object
 * @param coordinate - The coordinate to get the back spaces for
 * @param facing - The facing to get the back spaces for
 * @returns A set of the back space coordinates (up to 3 spaces, including diagonals)
 */
export function getBackSpaces(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing
): Set<BoardCoordinate<Board>> {
  const oppositeFacing = getOppositeFacing(facing);
  const backSpaces = getFrontSpaces(board, coordinate, oppositeFacing);
  return backSpaces;
}
