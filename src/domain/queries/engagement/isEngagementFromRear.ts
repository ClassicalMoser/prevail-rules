import type { UnitFacing, ValidationResult } from '@entities';
import { getAdjacentFacings } from '@queries/facings';

/**
 * Determines if an engagement is from the rear.
 * @param attackerFacing - The target facing of the attacking unit
 * @param defenderFacing - The current facing of the defending unit
 * @returns ValidationResult indicating if the engagement is from the rear
 */
export function isEngagementFromRear(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): ValidationResult {
  try {
    const adjacentFacings = getAdjacentFacings(defenderFacing);
    const requiredFacings = new Set([...adjacentFacings, defenderFacing]);
    if (requiredFacings.has(attackerFacing)) {
      return {
        result: true,
      };
    }
    return {
      result: false,
      errorReason: 'Attacker is not facing a similar direction to the defender',
    };
  } catch {
    return {
      result: false,
      errorReason: 'Unknown error determining if engagement is from rear',
    };
  }
}
