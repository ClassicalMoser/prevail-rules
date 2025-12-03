import type { Board, BoardCoordinate, UnitFacing } from '@entities';
import { filterUndefinedSpaces, getForwardSpacesToEdge } from '@functions';
import { getInlineSpaces } from './getInlineSpaces';

/**
 * Internal helper that extends spaces in a given direction.
 * This is the shared logic between getSpacesAhead and getSpacesBehind.
 *
 * @param board - The board object
 * @param initialSpaces - The initial set of spaces to extend from
 * @param facing - The facing direction (used for inline spaces)
 * @param extensionFacing - The facing direction to extend spaces to the edge
 * @returns A set of all spaces in the direction
 */
function getSpacesInDirection<TBoard extends Board>(
  board: TBoard,
  initialSpaces: Set<BoardCoordinate<TBoard>>,
  facing: UnitFacing,
  extensionFacing: UnitFacing,
): Set<BoardCoordinate<TBoard>> {
  const spaces = new Set(initialSpaces);

  // Add the inline spaces for all initial spaces (prevents checkerboard for diagonal facings)
  for (const space of initialSpaces) {
    const inlineSpaces = getInlineSpaces(board, space, facing);
    for (const inlineSpace of inlineSpaces) spaces.add(inlineSpace);
  }

  // Add all spaces extending to the edge
  // Convert to array to avoid iterating over a set while modifying it
  const spacesArray = Array.from(spaces);
  for (const space of spacesArray) {
    const spacesToEdge = getForwardSpacesToEdge(board, space, extensionFacing);
    for (const spaceToEdge of spacesToEdge) spaces.add(spaceToEdge);
  }

  // Filter out undefined values
  return filterUndefinedSpaces(spaces);
}

export { getSpacesInDirection };
