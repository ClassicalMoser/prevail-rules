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
 *
 * TODO(composition): nothing in this repository calls this; only its pair,
 * `getSpacesBehind`, has a rule (§2.3.3). Settle whether a rule should ask
 * it, or it stays as API for the packages built on these rules.
 */
export function getSpacesAhead(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  // The half of the board past the unit's own line, the way it faces.
  return getHalfPlaneInDirection(board, coordinate, facing);
}
