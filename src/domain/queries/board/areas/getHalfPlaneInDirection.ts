import type { Board, Coordinate, UnitFacing } from '@entities';
import { filterUndefinedSpaces } from '../filterUndefinedSpaces';
import { getFrontSpaces } from '../adjacency';
import { getForwardSpacesToEdge } from '../steps/getForwardSpacesToEdge';

import { getInlineSpaces } from './getInlineSpaces';

/**
 * Half-plane in front of a coordinate. Shared by getSpacesAhead and getSpacesBehind.
 * Starts from the spaces directly ahead, adds the inline line through each of those
 * spaces (perpendicular to the facing, so a diagonal fill does not checkerboard),
 * then walks every collected space forward to the edge.
 *
 * @param board - The board object
 * @param coordinate - The coordinate the half-plane is in front of
 * @param facing - The direction of the half-plane
 * @returns Spaces in front of the coordinate, out to the board edge
 */
function getHalfPlaneInDirection(
  board: Board,
  coordinate: Coordinate,
  facing: UnitFacing,
): Set<Coordinate> {
  // The spaces directly ahead are the first rank in front of the coordinate.
  const initialSpaces = getFrontSpaces(board, coordinate, facing);
  const spaces = new Set(initialSpaces);

  // Add the inline spaces for all initial spaces (prevents checkerboard for diagonal facings)
  for (const space of initialSpaces) {
    const inlineSpaces = getInlineSpaces(board, space, facing);
    for (const inlineSpace of inlineSpaces) {
      spaces.add(inlineSpace);
    }
  }

  // Add all spaces extending to the edge
  // Convert to array to avoid iterating over a set while modifying it
  const spacesArray = [...spaces];
  for (const space of spacesArray) {
    const spacesToEdge = getForwardSpacesToEdge(board, space, facing);
    for (const spaceToEdge of spacesToEdge) {
      spaces.add(spaceToEdge);
    }
  }

  // Filter out undefined values
  return filterUndefinedSpaces(spaces);
}

export { getHalfPlaneInDirection };
