import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { Board, BoardCoordinate } from "../../../entities/board/board.js";
import { getOppositeFacing } from "../../facings/getOppositeFacing.js";
import { getFrontSpaces } from "./getFrontSpaces.js";

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
