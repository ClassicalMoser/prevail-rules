import type { Board, BoardCoordinate } from '@entities';
import { unitFacings } from '@entities';
import { filterUndefinedSpaces, getForwardSpace } from '@functions';

/**
 * Get the adjacent spaces for a given coordinate.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the adjacent spaces for
 * @returns A set of the adjacent space coordinates (up to 8 spaces)
 */
export function getAdjacentSpaces<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
): Set<BoardCoordinate<TBoard>> {
  // One space in each of the eight directions from the given coordinate
  const adjacentSpaces = new Set(
    unitFacings.map((facing) => getForwardSpace(board, coordinate, facing)),
  );

  // Filter out undefined values
  const validAdjacentSpaces = filterUndefinedSpaces(adjacentSpaces);

  // Return set of valid adjacent spaces
  return validAdjacentSpaces;
}
