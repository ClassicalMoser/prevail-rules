import type { Board, Coordinate } from '@entities';
import { orthogonalFacings } from '@entities';
import { filterUndefinedSpaces } from '../filterUndefinedSpaces';
import { getForwardSpace } from '../getForwardSpace';

/**
 * Get the orthogonally adjacent spaces for a given coordinate.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the orthogonally adjacent spaces for
 * @returns A set of the orthogonally adjacent space coordinates (up to 4 spaces)
 */
export function getOrthogonallyAdjacentSpaces(
  board: Board,
  coordinate: Coordinate,
): Set<Coordinate> {
  // Get the orthogonal spaces
  const orthogonalSpaces = new Set(
    orthogonalFacings.map((facing) =>
      getForwardSpace(board, coordinate, facing),
    ),
  );
  // Filter out undefined values
  const validOrthogonalSpaces = filterUndefinedSpaces(orthogonalSpaces);
  // Return the orthogonal spaces
  return validOrthogonalSpaces;
}
