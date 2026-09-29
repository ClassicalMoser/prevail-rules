import type { UnitFacing } from '@entities';
import type { ValidationResult } from '@utils';
import { getOppositeFacing } from '@queries/facings';

/**
 * Whether the attacker meets the defender head-on.
 * The attacker's facing must be the opposite of the defender's facing.
 */
export function isEngagementFromFront(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): ValidationResult {
  const requiredFacing = getOppositeFacing(defenderFacing);
  if (attackerFacing === requiredFacing) {
    return {
      result: true,
    };
  }
  return {
    errorReason: 'Attacker is not facing opposite the defender',
    result: false,
  };
}
