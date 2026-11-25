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
  // Facing the way the defender faces, or 45° off it: the mover came from
  // behind, and the defender routs on the spot (§6.3.3).
  if (isEngagementFromRear(attackerFacing, defenderFacing)) {
    return 'rear';
  }

  // Facing 90° across the defender: it is turned to face the mover and may
  // not fall back (§6.3.4).
  if (isEngagementFromFlank(attackerFacing, defenderFacing)) {
    return 'flank';
  }

  // Facing it head on: the defender may be offered a retreat (§6.3.2).
  if (isEngagementFromFront(attackerFacing, defenderFacing)) {
    return 'front';
  }

  // Facing 135° off: a front approach always squares up (§6.2.3), so a move
  // never ends this way; the caller decides what that means.
  return undefined;
}
