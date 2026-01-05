import type { Board, BoardCoordinate } from '@entities';
import { diagonalFacings } from '@entities';
import { filterUndefinedSpaces } from '../filterUndefinedSpaces';
import { getForwardSpace } from '../getForwardSpace';

/**
 * Get the diagonally adjacent spaces for a given coordinate.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the diagonally adjacent spaces for
 * @returns A set of the diagonally adjacent space coordinates (up to 4 spaces)
 */
export function getDiagonallyAdjacentSpaces<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
): Set<BoardCoordinate<TBoard>> {
  // Get the diagonal spaces
  const diagonalSpaces = new Set(
    diagonalFacings.map((facing) => getForwardSpace(board, coordinate, facing)),
  );
  // Filter out undefined values
  const validDiagonalSpaces = filterUndefinedSpaces(diagonalSpaces);
  // Return the diagonal spaces
  return validDiagonalSpaces;
}
