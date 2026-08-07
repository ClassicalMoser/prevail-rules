import type { UnitFacing } from '@entities';
import type { ValidationResult } from '@utils';
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
  const requiredFacings = getOrthogonalFacings(defenderFacing);
  if (requiredFacings.has(attackerFacing)) {
    return {
      result: true,
    };
  }
  return {
    errorReason: 'Attacker is not facing orthogonal to the defender',
    result: false,
  };
}
