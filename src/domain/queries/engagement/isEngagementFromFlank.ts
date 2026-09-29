import type { UnitFacing } from '@entities';
import type { ValidationResult } from '@utils';
import { getOrthogonalFacings } from '@queries/facings';

/**
 * Whether the attacker meets the defender from the flank.
 * The attacker's facing must be one of the two facings perpendicular to the defender.
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
