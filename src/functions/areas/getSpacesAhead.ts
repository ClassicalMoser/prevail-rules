import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { Board, BoardCoordinate } from "../../entities/board/board.js";
import { getFrontSpaces } from "../adjacency/getFrontSpaces.js";
import { filterUndefinedSpaces } from "../filterUndefinedSpaces.js";
import { getForwardSpacesToEdge } from "../getForwardSpacesToEdge.js";
import { getInlineSpaces } from "./getInlineSpaces.js";

/**
 * Get the spaces ahead for a given coordinate and facing.
 * This includes all spaces on the board in front of the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces ahead for
 * @param facing - The facing to get the spaces ahead for
 * @returns A set of the space coordinates
 * (all spaces on the board in front of the facing's inline spaces)
 */
export function getSpacesAhead(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing,
): Set<BoardCoordinate<Board>> {
  // Start with the front spaces
  const spacesAhead = getFrontSpaces(board, coordinate, facing);

  // Add the inline spaces for all three (prevents checkerboard for diagonal facings)
  for (const space of spacesAhead) {
    const inlineSpaces = getInlineSpaces(board, space, facing);
    for (const inlineSpace of inlineSpaces) spacesAhead.add(inlineSpace);
  }

  // Get the rest of the spaces ahead
  for (const space of spacesAhead) {
    const spacesToEdge = getForwardSpacesToEdge(board, space, facing);
    for (const spaceToEdge of spacesToEdge) spacesAhead.add(spaceToEdge);
  }

  // Filter out undefined values
  const validSpacesAhead = filterUndefinedSpaces(spacesAhead);

  // Return set of valid spaces ahead
  return validSpacesAhead;
}
