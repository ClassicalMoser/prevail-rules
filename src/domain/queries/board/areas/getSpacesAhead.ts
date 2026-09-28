import type { Board, Coordinate, UnitFacing } from '@entities';
import { getHalfPlaneInDirection } from './getHalfPlaneInDirection';

/**
 * Get the spaces ahead for a given coordinate and facing.
 * This includes all spaces on the board in front of the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces ahead for
 * @param facing - The facing to get the spaces ahead for
 * @returns A set of the space coordinates
 * (all spaces on the board in front of the facing's inline spaces)
 */
export function getSpacesAhead(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  return getHalfPlaneInDirection(board, coordinate, facing);
}
