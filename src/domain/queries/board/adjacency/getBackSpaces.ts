import type { Board, Coordinate, UnitFacing } from '@entities';
import { getOppositeFacing } from '@queries/facings';
import { getFrontSpaces } from './getFrontSpaces';

/**
 * Get the back spaces for a given coordinate and facing, including diagonals
 * @param board - The board object
 * @param coordinate - The coordinate to get the back spaces for
 * @param facing - The facing to get the back spaces for
 * @returns A set of the back space coordinates (up to 3 spaces, including diagonals)
 */
export function getBackSpaces(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  const oppositeFacing = getOppositeFacing(facing);
  const backSpaces = getFrontSpaces(board, coordinate, oppositeFacing);
  return backSpaces;
}
