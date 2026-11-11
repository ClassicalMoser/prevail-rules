import type { UnitFacing } from '@entities';
import { getAdjacentFacings } from '@queries/facings';

/**
 * Whether the attacker meets the defender from the rear (§6.3.3): its facing
 * is the defender's own or one of the two beside it.
 *
 * @param attackerFacing - Which way the engaging unit faces
 * @param defenderFacing - Which way the defender faces
 * @returns True when the engagement is from the rear
 */
export function isEngagementFromRear(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): boolean {
  const rearFacings = new Set([
    ...getAdjacentFacings(defenderFacing),
    defenderFacing,
  ]);
  const fromRear = rearFacings.has(attackerFacing);
  return fromRear;
}
