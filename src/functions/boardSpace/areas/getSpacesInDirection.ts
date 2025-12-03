import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import type { UnitFacing } from "@entities/unit/unitFacing.js";
import { getInlineSpaces } from "@functions/boardSpace/areas/getInlineSpaces.js";
import { filterUndefinedSpaces } from "@functions/boardSpace/filterUndefinedSpaces.js";
import { getForwardSpacesToEdge } from "@functions/boardSpace/getForwardSpacesToEdge.js";

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
function getSpacesInDirection(
  board: Board,
  initialSpaces: Set<BoardCoordinate<Board>>,
  facing: UnitFacing,
  extensionFacing: UnitFacing,
): Set<BoardCoordinate<Board>> {
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
