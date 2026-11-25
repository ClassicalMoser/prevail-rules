import type { Board, PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import {
  getBoardSpace,
  hasEngagedUnits,
  hasNoUnit,
  isFriendlyUnit,
} from '@queries';
import { canEngageEnemy } from '../engaging';

/**
 * Determines whether a unit can move into (end its movement at) a specific coordinate.
 *
 * @param unitSide - The player side of the moving unit
 * @param board - The board state
 * @param destinationCoordinate - The coordinate to check if we can end our movement at
 * @param adjacentCoordinate - The coordinate at the time of this check (where we're moving from)
 * @param moveStartCoordinate - The coordinate at the beginning of the move
 * @param remainingFlexibility - The remaining flexibility at the time of this check
 * @param direction - An ordered advance, which may end on an enemy it can engage, or a forced retreat, which may not
 * @returns True if the unit can end its movement at this coordinate, false otherwise
 * @throws Error when the coordinate is not on the board: the caller names a
 * space it has already found, so an absent one is a fault, not a refusal
 */
export function canMoveInto(
  unitSide: PlayerSide,
  board: Board,
  destinationCoordinate: Coordinate,
  adjacentCoordinate: Coordinate,
  moveStartCoordinate: Coordinate,
  remainingFlexibility: number,
  direction: 'advance' | 'retreat',
): boolean {
  // Find the board space at the given coordinate.
  const space = getBoardSpace(board, destinationCoordinate);
  const spaceUnitPresence = space.unitPresence;

  // If the space has no unit presence, any unit can move into it.
  // Open ground may always be rested on (§5.3).
  if (hasNoUnit(spaceUnitPresence)) {
    return true;
  }

  // If the space has two units engaged in combat, no unit can move into it.
  // Nothing enters an engaged space until its fight is settled (§2.2.3).
  if (hasEngagedUnits(spaceUnitPresence)) {
    return false;
  }

  // What is left is a single unit standing alone.
  // A friendly occupant blocks the end of the move.
  // A space holds one unit (§2.2.1): a friend may be passed through, never
  // stopped on (§5.3). (`canEngageEnemy` would refuse a friend too; this
  // says the rule where it belongs.)
  if (isFriendlyUnit(spaceUnitPresence.unit, unitSide)) {
    return false;
  }

  // Player can advance into a space with an enemy unit
  // If they can engage the enemy.
  // Whether it can depends on the side it steps in from (§6.2).
  if (direction === 'advance') {
    const canEngage = canEngageEnemy(
      unitSide,
      board,
      destinationCoordinate,
      adjacentCoordinate,
      moveStartCoordinate,
      remainingFlexibility,
    );
    return canEngage;
  }

  // Player cannot retreat into a space with an enemy unit.
  // A retreat never creates an engagement (§9.1.7).
  return false;
}
