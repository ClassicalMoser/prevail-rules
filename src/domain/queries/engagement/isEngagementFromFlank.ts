import type { UnitFacing, ValidationResult } from '@entities';
import { getOrthogonalFacings } from '@queries/facings';

/**
 * Determines if an engagement is from the flank.
 * @param attackerFacing - The target facing of the attacking unit
 * @param defenderFacing - The current facing of the defending unit
 * @returns ValidationResult indicating if the engagement is from the flank
 */
export function isEngagementFromFlank(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): ValidationResult {
  try {
    const requiredFacings = getOrthogonalFacings(defenderFacing);
    if (requiredFacings.has(attackerFacing)) {
      return {
        result: true,
      };
    }
    return {
      result: false,
      errorReason: 'Attacker is not facing orthogonal to the defender',
    };
  } catch {
    return {
      result: false,
      errorReason: 'Unknown error determining if engagement is from flank',
    };
  }
}
