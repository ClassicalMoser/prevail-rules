import type { Board, Coordinate, UnitFacing } from '@entities';
import { getOppositeFacing } from '@queries/facings';

import { getHalfPlaneInDirection } from './getHalfPlaneInDirection';

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
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  // The rear half-plane is the front half-plane of the opposite facing.
  return getHalfPlaneInDirection(board, coordinate, getOppositeFacing(facing));
}
