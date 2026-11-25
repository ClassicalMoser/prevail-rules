import type { UnitFacing } from '@entities';
import { getOrthogonalFacings } from '@queries/facings';

/**
 * Whether the attacker meets the defender from the flank (§6.3.4): its facing
 * is one of the two perpendicular to the defender's.
 *
 * @param attackerFacing - Which way the engaging unit faces
 * @param defenderFacing - Which way the defender faces
 * @returns True when the engagement is from the flank
 */
export function isEngagementFromFlank(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): boolean {
  // The two facings at right angles to the defender's: the mover looks
  // across it.
  const fromFlank = getOrthogonalFacings(defenderFacing).has(attackerFacing);

  // True when the mover looks across the defender.
  return fromFlank;
}
