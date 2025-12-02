import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { Board, UnitInstance } from "src/entities/index.js";
import { getBoardSpace } from "src/functions/boardSpace/getBoardSpace.js";
import { areSameSide } from "src/functions/unit/index.js";
import {
  hasEngagedUnits,
  hasNoUnit,
  hasSingleUnit,
} from "src/functions/unitPresence/index.js";
import { MIN_FLEXIBILITY_THRESHOLD } from "src/sampleValues/ruleValues.js";

/**
 * Determines whether a unit can move through (pass over) a specific coordinate.
 * Requires combined flexibility >= MIN_FLEXIBILITY_THRESHOLD for friendly units.
 *
 * @param unit - The unit attempting to move through
 * @param board - The board state
 * @param coordinate - The coordinate to check
 * @returns True if the unit can pass through this coordinate, false otherwise
 */
export function canMoveThrough<TBoard extends Board>(
  unit: UnitInstance,
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
): boolean {
  try {
    // Find the board space at the given coordinate.
    const space = getBoardSpace(board, coordinate);
    const spaceUnitPresence = space.unitPresence;

    // If the space has no unit presence, any unit can move through it.
    if (hasNoUnit(spaceUnitPresence)) {
      return true;
    }

    // If the space has two units engaged in combat, no unit can move through it.
    if (hasEngagedUnits(spaceUnitPresence)) {
      return false;
    }

    // If the space has a single unit, further checks are needed.
    if (hasSingleUnit(spaceUnitPresence)) {
      // Player cannot move through an unfriendly unit.
      if (!areSameSide(spaceUnitPresence.unit, unit)) {
        return false;
      }
      // A player can only move through their own unit if the combined
      // flexibility value of the two units totals 4 or more.
      const unitFlexibility = unit.unitType.flexibility;
      const spaceUnitFlexibility = spaceUnitPresence.unit.unitType.flexibility;
      const combinedFlexibility = unitFlexibility + spaceUnitFlexibility;
      if (combinedFlexibility < MIN_FLEXIBILITY_THRESHOLD) {
        return false;
      }
    }

    return true;
  } catch {
    // If the coordinate doesn't exist, the unit cannot move through it.
    return false;
  }
}
