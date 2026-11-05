import type { BoardSpace, PlayerSide } from '@entities';
import type { ValidationResult } from '@utils';
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
): ValidationResult {
  try {
    // An engagement counts as an enemy for either player.
    // The two sides are not compared.
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
          errorReason: 'Unit is not an enemy',
          result: false,
        };
      }
      return {
        result: true,
      };
    }
    // Otherwise, no unit - no enemy unit.
    return {
      errorReason: 'No enemy unit found',
      result: false,
    };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
