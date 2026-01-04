import type {
  Board,
  BoardCoordinate,
  GameState,
  UnitInstance,
} from '@entities';
import { areSameSide, getBoardSpace, getCurrentUnitStat } from '@queries';
import { MIN_FLEXIBILITY_THRESHOLD } from '@ruleValues';
import { hasEngagedUnits, hasNoUnit } from '@validation/unitPresence';

/**
 * Determines whether a unit can move through (pass over) a specific coordinate.
 * Requires combined flexibility >= MIN_FLEXIBILITY_THRESHOLD for friendly units.
 *
 * @param unit - The unit attempting to move through
 * @param coordinate - The coordinate to check
 * @param gameState - The current game state
 * @returns True if the unit can pass through this coordinate, false otherwise
 */
export function canMoveThrough<TBoard extends Board>(
  unit: UnitInstance,
  coordinate: BoardCoordinate<TBoard>,
  gameState: GameState<TBoard>,
): boolean {
  // Get the board state
  const board = gameState.boardState;
  // Get the current flexibility of the unit
  const currentUnitFlexibility = getCurrentUnitStat(
    unit,
    'flexibility',
    gameState,
  );
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
    else {
      // Player cannot move through an unfriendly unit.
      if (!areSameSide(spaceUnitPresence.unit, unit)) {
        return false;
      }
      // A player can only move through their own unit if the combined
      // flexibility value of the two units totals 4 or more.
      const currentSpaceUnitFlexibility = getCurrentUnitStat(
        spaceUnitPresence.unit,
        'flexibility',
        gameState,
      );
      const combinedFlexibility =
        currentUnitFlexibility + currentSpaceUnitFlexibility;
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
