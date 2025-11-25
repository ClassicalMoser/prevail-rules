import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { Board, BoardCoordinate } from "../../../entities/board/board.js";
import { getBackSpaces } from "../adjacency/getBackSpaces.js";
import { filterUndefinedSpaces } from "../filterUndefinedSpaces.js";
import { getForwardSpacesToEdge } from "../getForwardSpacesToEdge.js";
import { getOppositeFacing } from "../../facings/getOppositeFacing.js";
import { getInlineSpaces } from "./getInlineSpaces.js";

/**
 * Get the spaces behind for a given coordinate and facing.
 * This includes all spaces on the board behind the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces behind for
 * @param facing - The facing to get the spaces behind for
 * @returns A set of the space coordinates
 * (all spaces on the board behind the facing's inline spaces)
 */
export function getSpacesBehind(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing
): Set<BoardCoordinate<Board>> {
  // Start with the back spaces
  const spacesBehind = getBackSpaces(board, coordinate, facing);

  // Add the inline spaces for all three (prevents checkerboard for diagonal facings)
  for (const space of spacesBehind) {
    const inlineSpaces = getInlineSpaces(board, space, facing);
    for (const inlineSpace of inlineSpaces) spacesBehind.add(inlineSpace);
  }

  // Get the direction backward from the facing
  const backwardFacing = getOppositeFacing(facing);

  // Add all spaces behind the solid line.
  for (const space of spacesBehind) {
    const spacesToEdge = getForwardSpacesToEdge(board, space, backwardFacing);
    for (const spaceToEdge of spacesToEdge) spacesBehind.add(spaceToEdge);
  }

  // Filter out undefined values
  const validSpacesBehind = filterUndefinedSpaces(spacesBehind);

  // Return set of valid spaces behind
  return validSpacesBehind;
}
