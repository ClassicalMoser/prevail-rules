import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { Board, UnitInstance } from "src/entities/index.js";
import { getBoardSpace } from "src/functions/boardSpace/getBoardSpace.js";

export function canMoveInto<TBoard extends Board>(
  unit: UnitInstance,
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>
) {
  try {
    // Find the board space at the given coordinate.
    const space = getBoardSpace(board, coordinate);
    // If the space has no unit presence, any unit can move into it.
    const spaceUnitPresence = space.unitPresence;
    if (spaceUnitPresence.presenceType === "none") {
      return true;
    }
    // If the space has two units engaged in combat, no unit can move into it.
    if (spaceUnitPresence.presenceType === "engaged") {
      return false;
    }
    // If the space has a single unit, further checks are needed.
    if (spaceUnitPresence.presenceType === "single") {
      // Check if the unit is friendly or enemy.
      const unitOwner = unit.playerSide;
      const spaceUnitOwner = spaceUnitPresence.unit.playerSide;
      // Player cannot move into a space with a friendly unit.
      if (spaceUnitOwner === unitOwner) {
        return false;
      }
      // Player can move into a space with an enemy unit.
      return true;
    }
  } catch {
    // If the coordinate doesn't exist, the unit cannot move through it.
    return false;
  }
}
