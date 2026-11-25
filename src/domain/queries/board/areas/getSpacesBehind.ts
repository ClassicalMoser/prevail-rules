import type { Board, UnitFacing } from '@entities';
import type { Coordinate } from '@ruleValues';
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
 *
 * The rules' "behind a unit" (§2.3.3): the whole back half of the field, not
 * a wedge. A rear engagement needs the mover to have begun there (§6.2.2,
 * `canEngageEnemy`), and a retreat must stay within it (§9.1.2,
 * `createMoveContext`).
 */
export function getSpacesBehind(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  // The rear half-plane is the front half-plane of the opposite facing.
  return getHalfPlaneInDirection(board, coordinate, getOppositeFacing(facing));
}
