import type { Board } from '@entities';
import type { Coordinate } from '@ruleValues';
import { orthogonalFacings } from '@entities';
import { getSpacesInDirections } from './getSpacesInDirections';

/**
 * Get the orthogonally adjacent spaces for a given coordinate.
 *
 * TODO(composition): nothing in this repository calls this. Settle whether a
 * rule should ask it, or the family keeps it as API for the packages built on
 * these rules.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the orthogonally adjacent spaces for
 * @returns A set of the orthogonally adjacent space coordinates (up to 4 spaces)
 */
export function getOrthogonallyAdjacentSpaces(
  board: Board,
  coordinate: Coordinate,
): Set<Coordinate> {
  // The four spaces at its sides, one straight north, east, south and west.
  const orthogonalSpaces = getSpacesInDirections(
    board,
    coordinate,
    orthogonalFacings,
  );

  // Those of the four that are on the board.
  return orthogonalSpaces;
}
