import type { BoardSpace, PlayerSide, ValidationResult } from '@entities';
import { hasEngagedUnits, hasSingleUnit } from '@entities';

/**
 * Checks if an enemy unit is found in the space.
 * @param playerSide - The side of the player to check for enemy units.
 * @param space - The space to check.
 * @returns True if an enemy unit is found in the space, false otherwise.
 */
export function hasEnemyUnit(
  playerSide: PlayerSide,
  space: BoardSpace,
): ValidationResult {
  try {
    // If the space has engaged units, there is an enemy unit.
    if (hasEngagedUnits(space.unitPresence)) {
      return {
        result: true,
      };
    }
    // If the space has a single unit, check if it is an enemy unit.
    if (hasSingleUnit(space.unitPresence)) {
      // If the unit is on the wrong side, there is an enemy unit.
      const unitSide = space.unitPresence.unit.playerSide;
      const isEnemy = unitSide !== playerSide;
      if (!isEnemy) {
        return {
          result: false,
          errorReason: 'Unit is not an enemy',
        };
      }
      return {
        result: true,
      };
    }
    // Otherwise, no unit - no enemy unit.
    return {
      result: false,
      errorReason: 'No enemy unit found',
    };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
