import type { Board, UnitFacing } from '@entities';
import type { Coordinate } from '@ruleValues';
import { getAdjacentFacings } from '@queries/facings';
import { getSpacesInDirections } from './getSpacesInDirections';

/**
 * Get the front spaces for a given coordinate and facing, including diagonals
 *
 * The three front spaces of §2.3.2. A friend that has the fighter in one of
 * these lends +2 melee support (§7.3.1), and a shooter's arc is built from
 * them a rank at a time (§2.4.3, `getSpacesInArc`).
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the front spaces for
 * @param facing - The facing to get the front spaces for
 * @returns A set of the front space coordinates (up to 3 spaces, including diagonals)
 */
export function getFrontSpaces(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  // A unit's front is the space it faces and the two 45° to either side.
  const forwardFacings = [...getAdjacentFacings(facing), facing];
  const frontSpaces = getSpacesInDirections(board, coordinate, forwardFacings);

  // Fewer than three where the unit faces an edge.
  return frontSpaces;
}
