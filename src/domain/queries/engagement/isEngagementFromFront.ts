import type { UnitFacing } from '@entities';
import type { ValidationResult } from '@utils';
import { getOppositeFacing } from '@queries/facings';

/**
 * Whether the attacker meets the defender head-on.
 * The attacker's facing must be the opposite of the defender's facing.
 */
// Front (opposite), flank (the two orthogonals) and rear (same and its two
// neighbours) cover six of the eight facings, and that is all of them that
// exist: a front approach squares up head-on as part of the engaging move
// (§6.2.3, `getEngagementEndFacing`), so no engagement ends 45° off. The
// throw in `generateStartEngagementEvent` remains as the guard on that
// guarantee.
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
