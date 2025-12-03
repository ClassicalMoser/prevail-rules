import type { Board, BoardCoordinate, UnitFacing } from '@entities';
import { getForwardSpace, getRightFacing } from '@functions';

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
export function getRightSpace<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing,
): BoardCoordinate<TBoard> | undefined {
  // Get the right-facing direction
  const rightFacing = getRightFacing(facing);
  // Get the right space
  const rightSpace = getForwardSpace(board, coordinate, rightFacing);
  return rightSpace;
}
