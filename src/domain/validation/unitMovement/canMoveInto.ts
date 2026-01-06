import type { Board, BoardCoordinate, PlayerSide, UnitFacing } from '@entities';
import { getBoardSpace } from '@queries';
import {
  hasEngagedUnits,
  hasNoUnit,
  hasSingleUnit,
} from '@validation/unitPresence';
import { canEngageEnemy } from './canEngageEnemy';

/**
 * Determines whether a unit can move into (end its movement at) a specific coordinate.
 *
 * @param unitSide - The player side of the moving unit
 * @param board - The board state
 * @param destinationCoordinate - The coordinate to check if we can end our movement at
 * @param adjacentCoordinate - The coordinate at the time of this check (where we're moving from)
 * @param moveStartCoordinate - The coordinate at the beginning of the move
 * @param currentFacing - The facing of the unit at the time of this check
 * @param remainingFlexibility - The remaining flexibility at the time of this check
 * @returns True if the unit can end its movement at this coordinate, false otherwise
 */
export function canMoveInto<TBoard extends Board>(
  unitSide: PlayerSide,
  board: TBoard,
  destinationCoordinate: BoardCoordinate<TBoard>,
  adjacentCoordinate: BoardCoordinate<TBoard>,
  moveStartCoordinate: BoardCoordinate<TBoard>,
  currentFacing: UnitFacing,
  remainingFlexibility: number,
  direction: 'advance' | 'retreat',
): boolean {
  try {
    // Find the board space at the given coordinate.
    const space = getBoardSpace(board, destinationCoordinate);
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
      if (spaceUnitPresence.unit.playerSide === unitSide) {
        return false;
      }
      // Player can advance into a space with an enemy unit
      // if they can engage the enemy.
      if (direction === 'advance') {
        return canEngageEnemy(
          unitSide,
          board,
          destinationCoordinate,
          adjacentCoordinate,
          moveStartCoordinate,
          currentFacing,
          remainingFlexibility,
        );
      } else {
        // Player cannot retreat into a space with an enemy unit.
        return false;
      }
    }

    // This represents an invalid board state. We should never get here.
    return false;
  } catch {
    // Any error means the unit cannot move into this coordinate.
    return false;
  }
}
