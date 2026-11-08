import type { UnitFacing } from '@entities';
import type { ValidationResult } from '@utils';
import { getOppositeFacing } from '@queries/facings';

/**
 * Whether the attacker meets the defender head-on.
 * The attacker's facing must be the opposite of the defender's facing.
 */
// TODO(wrong): front (opposite), flank (the two orthogonals) and rear (same
// and its two neighbours) cover six of the eight facings. An attacker 45° off
// head-on is none of them, and `generateStartEngagementEvent` throws for it.
// Settled by saying which engagement that is, and whether movement can end an
// approach at that facing.
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
