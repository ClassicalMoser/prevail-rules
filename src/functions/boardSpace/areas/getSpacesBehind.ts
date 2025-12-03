import type { Board, BoardCoordinate, UnitFacing } from '@entities';
import { getBackSpaces, getOppositeFacing } from '@functions';
import { getSpacesInDirection } from './getSpacesInDirection';

/**
 * Get the spaces behind for a given coordinate and facing.
 * This includes all spaces on the board behind the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces behind for
 * @param facing - The facing to get the spaces behind for
 * @returns A set of the space coordinates
 * (all spaces on the board behind the facing's inline spaces)
 */
export function getSpacesBehind<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing,
): Set<BoardCoordinate<TBoard>> {
  // Start with the back spaces
  const backSpaces = getBackSpaces(board, coordinate, facing);

  // Get the direction backward from the facing
  const backwardFacing = getOppositeFacing(facing);

  // Extend spaces in the backward direction
  return getSpacesInDirection(board, backSpaces, facing, backwardFacing);
}
