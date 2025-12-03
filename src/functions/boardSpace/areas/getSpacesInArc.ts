import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";

import type { UnitFacing } from "@entities/unit/unitFacing.js";
import { getFrontSpaces } from "@functions/boardSpace/adjacency/getFrontSpaces.js";
import { filterUndefinedSpaces } from "@functions/boardSpace/index.js";

export function getSpacesInArc(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing,
  range: number,
): Set<BoardCoordinate<Board>> {
  // Start with the origin space
  const spacesInArc = new Set<BoardCoordinate<Board>>([coordinate]);
  // Add the spaces in front of the origin space
  for (let i = 0; i < range; i++) {
    // Iterate forward by spaces in front, up to the range.
    const currentSpacesInArc = [...spacesInArc];
    for (const space of currentSpacesInArc) {
      // Get the spaces in front of the current space
      const spacesInFront = getFrontSpaces(board, space, facing);
      // Add the spaces in front of the current space to the set
      for (const space of spacesInFront) {
        spacesInArc.add(space);
      }
    }
  }
  // Remove the origin space
  spacesInArc.delete(coordinate);
  // Filter out undefined values
  const validSpacesInArc = filterUndefinedSpaces(spacesInArc);
  // Return the set of valid spaces in the arc
  return validSpacesInArc;
}
