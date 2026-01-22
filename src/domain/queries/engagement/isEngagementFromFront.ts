import type { UnitFacing, ValidationResult } from '@entities';
import { getOppositeFacing } from '@queries/facings';

/**
 * Determines if an engagement is from the front.
 * @param attackerFacing - The target facing of the attacking unit
 * @param defenderFacing - The current facing of the defending unit
 * @returns ValidationResult indicating if the engagement is from the front
 */
export function isEngagementFromFront(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): ValidationResult {
  try {
    const requiredFacing = getOppositeFacing(defenderFacing);
    if (attackerFacing === requiredFacing) {
      return {
        result: true,
      };
    }
    return {
      result: false,
      errorReason: 'Attacker is not facing opposite the defender',
    };
  } catch {
    return {
      result: false,
      errorReason: 'Unknown error determining if engagement is from front',
    };
  }
}
