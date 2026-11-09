import type { UnitFacing } from '@entities';

import { getAdjacentFacings } from './getAdjacentFacings';
import { getOppositeFacing } from './getOppositeFacing';

/**
 * The facings one Flexibility spend reaches (§5.2.1): a turn is 45° to
 * either side, or 180° about — never anything else. Wheeling 90° therefore
 * takes two turns, which is what keeps a stiff formation stiff: a phalanx
 * with Flexibility 1 cannot swing to meet a flank threat in one order.
 *
 * @param facing - The facing the unit turns from
 * @returns The three facings a single turn may end on
 */
export function getFacingsOneTurnAway(facing: UnitFacing): Set<UnitFacing> {
  // 45° to either side of the current facing.
  const adjacents = getAdjacentFacings(facing);
  // The about-turn: drilled troops can face rear in one motion.
  const opposite = getOppositeFacing(facing);
  // Combined set
  const targets = new Set([...adjacents, opposite]);
  return targets;
}
