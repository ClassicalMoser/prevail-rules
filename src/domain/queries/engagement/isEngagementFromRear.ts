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
  // The defender's own facing and the two 45° either side of it: the mover
  // faces roughly the way the defender does, so it has come from behind.
  const rearFacings = new Set([
    ...getAdjacentFacings(defenderFacing),
    defenderFacing,
  ]);
  const fromRear = rearFacings.has(attackerFacing);

  // True when the mover faces as the defender does, or nearly.
  return fromRear;
}
