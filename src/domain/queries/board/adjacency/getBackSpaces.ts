import type { Board, UnitFacing } from '@entities';
import type { Coordinate } from '@ruleValues';
import { getOppositeFacing } from '@queries/facings';
import { getFrontSpaces } from './getFrontSpaces';

/**
 * Get the back spaces for a given coordinate and facing, including diagonals
 *
 * The three spaces behind a unit (§2.3.2). A friend standing in one lends the
 * fighter no melee support (§7.3.1), and an unengaged enemy in one, facing
 * the unit, cuts off its retreat (§9.1.5, `isRetreatCutOff`).
 *
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
  // A unit's back is the front it would have if it faced the other way.
  const oppositeFacing = getOppositeFacing(facing);
  const backSpaces = getFrontSpaces(board, coordinate, oppositeFacing);

  // Fewer than three where the unit's back is to an edge.
  return backSpaces;
}
