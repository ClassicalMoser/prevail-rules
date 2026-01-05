import type { BoardSpace, PlayerSide } from '@entities';
import { hasEngagedUnits } from './hasEngagedUnits';
import { hasSingleUnit } from './hasSingleUnit';

/**
 * Checks if an enemy unit is found in the space.
 * @param playerSide - The side of the player to check for enemy units.
 * @param space - The space to check.
 * @returns True if an enemy unit is found in the space, false otherwise.
 */
export function hasEnemyUnit(
  playerSide: PlayerSide,
  space: BoardSpace,
): boolean {
  try {
    // If the space has engaged units, there is an enemy unit.
    if (hasEngagedUnits(space.unitPresence)) {
      return true;
    }
    // If the space has a single unit, check if it is an enemy unit.
    if (hasSingleUnit(space.unitPresence)) {
      // If the unit is on the wrong side, there is an enemy unit.
      const unitSide = space.unitPresence.unit.playerSide;
      const isEnemy = unitSide !== playerSide;
      return isEnemy;
    }
    // Otherwise, no unit - no enemy unit.
    return false;
  } catch {
    // Validation functions never throw - return false on any error
    // (e.g., malformed data, missing properties)
    return false;
  }
}
