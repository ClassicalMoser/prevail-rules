import type { Board, BoardCoordinate } from '@entities';
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
export function getOrthogonallyAdjacentSpaces<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
): Set<BoardCoordinate<TBoard>> {
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
