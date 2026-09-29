import type { UnitFacing } from '@entities';
import type { ValidationResult } from '@utils';
import { getAdjacentFacings } from '@queries/facings';

/**
 * Whether the attacker meets the defender from the rear.
 * The attacker faces the same way as the defender, or one facing off that way.
 */
export function isEngagementFromRear(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): ValidationResult {
  const adjacentFacings = getAdjacentFacings(defenderFacing);
  const requiredFacings = new Set([...adjacentFacings, defenderFacing]);
  if (requiredFacings.has(attackerFacing)) {
    return {
      result: true,
    };
  }
  return {
    errorReason: 'Attacker is not facing a similar direction to the defender',
    result: false,
  };
}
