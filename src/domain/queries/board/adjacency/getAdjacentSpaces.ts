import type { Board, Coordinate } from '@entities';
import { unitFacings } from '@entities';
import { getSpacesInDirections } from './getSpacesInDirections';

/**
 * Get the adjacent spaces for a given coordinate.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the adjacent spaces for
 * @returns A set of the adjacent space coordinates (up to 8 spaces)
 */
export function getAdjacentSpaces(
  board: Board,
  coordinate: Coordinate,
): Set<Coordinate> {
  // The eight spaces around it, one in each direction a unit can face.
  const adjacentSpaces = getSpacesInDirections(board, coordinate, unitFacings);
  return adjacentSpaces;
}
