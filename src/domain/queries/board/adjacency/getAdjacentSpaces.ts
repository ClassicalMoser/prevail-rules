import type { Board } from '@entities';
import type { Coordinate } from '@ruleValues';
import { unitFacings } from '@entities';
import { getSpacesInDirections } from './getSpacesInDirections';

/**
 * Get the adjacent spaces for a given coordinate: orthogonally or diagonally
 * touching, up to eight (§2.4.1). Melee support is looked for among these
 * (§7.3.1, `getMeleeSupportValue`).
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

  // Fewer than eight at an edge or a corner.
  return adjacentSpaces;
}
