import type { Board, Coordinate } from '@entities';
import { diagonalFacings } from '@entities';
import { getSpacesInDirections } from './getSpacesInDirections';

/**
 * Get the diagonally adjacent spaces for a given coordinate. Melee support
 * from one of these is lent only across an open diagonal (§7.3.1,
 * `getMeleeSupportValue`).
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the diagonally adjacent spaces for
 * @returns A set of the diagonally adjacent space coordinates (up to 4 spaces)
 */
export function getDiagonallyAdjacentSpaces(
  board: Board,
  coordinate: Coordinate,
): Set<Coordinate> {
  // The four spaces at its corners, one along each diagonal.
  const diagonalSpaces = getSpacesInDirections(
    board,
    coordinate,
    diagonalFacings,
  );

  // Those of the four that are on the board.
  return diagonalSpaces;
}
