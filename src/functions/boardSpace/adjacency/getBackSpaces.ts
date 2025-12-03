import type { Board, BoardCoordinate, UnitFacing } from "@entities";
import { getOppositeFacing } from "@functions";
import { getFrontSpaces } from "./getFrontSpaces";

/**
 * Get the back spaces for a given coordinate and facing, including diagonals
 * @param board - The board object
 * @param coordinate - The coordinate to get the back spaces for
 * @param facing - The facing to get the back spaces for
 * @returns A set of the back space coordinates (up to 3 spaces, including diagonals)
 */
export function getBackSpaces<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing
): Set<BoardCoordinate<TBoard>> {
  const oppositeFacing = getOppositeFacing(facing);
  const backSpaces = getFrontSpaces(board, coordinate, oppositeFacing);
  return backSpaces;
}
