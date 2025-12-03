import type { Board, BoardCoordinate, UnitInstance } from "@entities";
import {
  areSameSide,
  getBoardSpace,
  hasEngagedUnits,
  hasNoUnit,
  hasSingleUnit,
} from "@functions";

/**
 * Determines whether a unit can move into (end its movement at) a specific coordinate.
 *
 * @param unit - The unit attempting to move
 * @param board - The board state
 * @param coordinate - The coordinate to check
 * @returns True if the unit can end its movement at this coordinate, false otherwise
 */
export function canMoveInto<TBoard extends Board>(
  unit: UnitInstance,
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
): boolean {
  try {
    // Find the board space at the given coordinate.
    const space = getBoardSpace(board, coordinate);
    const spaceUnitPresence = space.unitPresence;

    // If the space has no unit presence, any unit can move into it.
    if (hasNoUnit(spaceUnitPresence)) {
      return true;
    }

    // If the space has two units engaged in combat, no unit can move into it.
    if (hasEngagedUnits(spaceUnitPresence)) {
      return false;
    }

    // If the space has a single unit, further checks are needed.
    if (hasSingleUnit(spaceUnitPresence)) {
      // Player cannot move into a space with a friendly unit.
      if (areSameSide(spaceUnitPresence.unit, unit)) {
        return false;
      }
      // Player can move into a space with an enemy unit.
      return true;
    } else {
      // All unit presence types have been handled (none, engaged, single).
      // This else block handles any unexpected state by returning false.
      return false;
    }
  } catch {
    // Any error means the unit cannot move into this coordinate.
    return false;
  }
}
