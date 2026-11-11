import type { UnitFacing } from '@entities';
import { getOppositeFacing } from '@queries/facings';

/**
 * Whether the attacker meets the defender from the front (§6.3.2): its facing
 * is exactly opposite the defender's.
 *
 * @param attackerFacing - Which way the engaging unit faces
 * @param defenderFacing - Which way the defender faces
 * @returns True when the engagement is from the front
 */
export function isEngagementFromFront(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): boolean {
  const fromFront = attackerFacing === getOppositeFacing(defenderFacing);
  return fromFront;
}
