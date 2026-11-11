import type { UnitFacing } from '@entities';
import { isEngagementFromFlank } from './isEngagementFromFlank';
import { isEngagementFromFront } from './isEngagementFromFront';
import { isEngagementFromRear } from './isEngagementFromRear';

/** How a unit meets the one it engages (§6.3). */
export type EngagementType = 'front' | 'flank' | 'rear';

/**
 * How a unit engaging another meets it, by the way each faces (§6.3): from
 * the rear when it faces as the defender does, from the flank when it faces
 * across the defender, from the front when it faces the defender head on. The
 * rear is the most severe and is read first.
 *
 * A pair of facings that meet in none of the three ways has no type; the
 * caller says what that means.
 *
 * @param attackerFacing - Which way the engaging unit faces
 * @param defenderFacing - Which way the defender faces
 * @returns The kind of engagement, or `undefined` for facings that engage none
 */
export function findEngagementType(
  attackerFacing: UnitFacing,
  defenderFacing: UnitFacing,
): EngagementType | undefined {
  if (isEngagementFromRear(attackerFacing, defenderFacing)) {
    return 'rear';
  }
  if (isEngagementFromFlank(attackerFacing, defenderFacing)) {
    return 'flank';
  }
  if (isEngagementFromFront(attackerFacing, defenderFacing)) {
    return 'front';
  }
  return undefined;
}
