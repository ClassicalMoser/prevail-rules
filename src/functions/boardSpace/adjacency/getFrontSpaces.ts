import type { Board, BoardCoordinate, UnitFacing } from '@entities';
import {
  filterUndefinedSpaces,
  getAdjacentFacings,
  getForwardSpace,
} from '@functions';

/**
 * Get the front spaces for a given coordinate and facing, including diagonals
 * @param board - The board object
 * @param coordinate - The coordinate to get the front spaces for
 * @param facing - The facing to get the front spaces for
 * @returns A set of the front space coordinates (up to 3 spaces, including diagonals)
 */
export function getFrontSpaces<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing,
): Set<BoardCoordinate<TBoard>> {
  // Get adjacent facings and add the facing to get the forward facings
  const adjacentFacings = getAdjacentFacings(facing);
  const forwardFacings = [...adjacentFacings, facing];

  // Array of coordinates and undefined values
  const forwardSpaces = new Set(
    forwardFacings.map((facing) => getForwardSpace(board, coordinate, facing)),
  );

  // Filter out undefined values
  const validForwardSpaces = filterUndefinedSpaces(forwardSpaces);

  // Return set of valid forward spaces
  return validForwardSpaces;
}
