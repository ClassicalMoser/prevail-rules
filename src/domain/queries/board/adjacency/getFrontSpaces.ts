import type { Board, Coordinate, UnitFacing } from '@entities';
import { getAdjacentFacings } from '@queries/facings';
import { getSpacesInDirections } from './getSpacesInDirections';

/**
 * Get the front spaces for a given coordinate and facing, including diagonals
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
  return frontSpaces;
}
