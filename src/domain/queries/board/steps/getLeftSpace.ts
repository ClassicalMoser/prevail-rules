import type { Board, Coordinate, UnitFacing } from '@entities';
import { getLeftFacing } from '@queries/facings';
import { getForwardSpace } from './getForwardSpace';

/**
 * Get the left space for a given coordinate and facing.
 * This is the space directly to the left of the given coordinate
 * relative to the given facing direction.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the left space for
 * @param facing - The facing to get the left space for
 * @returns The coordinate of the left space
 * (directly to the left of the given coordinate relative to the facing direction)
 * or undefined if the space is out of bounds
 */
export function getLeftSpace(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Coordinate | undefined {
  // Get the left-facing direction
  const leftFacing = getLeftFacing(facing);
  // Get the left space
  const leftSpace = getForwardSpace(board, coordinate, leftFacing);
  return leftSpace;
}
