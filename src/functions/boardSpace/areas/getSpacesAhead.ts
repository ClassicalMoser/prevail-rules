import type { Board, BoardCoordinate, UnitFacing } from '@entities';
import { getFrontSpaces } from '@functions';
import { getSpacesInDirection } from './getSpacesInDirection';

/**
 * Get the spaces ahead for a given coordinate and facing.
 * This includes all spaces on the board in front of the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces ahead for
 * @param facing - The facing to get the spaces ahead for
 * @returns A set of the space coordinates
 * (all spaces on the board in front of the facing's inline spaces)
 */
export function getSpacesAhead<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing,
): Set<BoardCoordinate<TBoard>> {
  // Start with the front spaces
  const frontSpaces = getFrontSpaces(board, coordinate, facing);

  // Extend spaces in the forward direction
  return getSpacesInDirection(board, frontSpaces, facing, facing);
}
