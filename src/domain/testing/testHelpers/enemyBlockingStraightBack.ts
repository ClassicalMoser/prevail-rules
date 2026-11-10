import type { UnitWithPlacement } from '@entities';
import { getOppositeFacing } from '@queries';
import { enemyCuttingOffRetreat } from './enemyCuttingOffRetreat';

/**
 * An enemy standing directly behind a unit with its back to it: it bars the
 * straight step back (§9.1.7) but does not cut the retreat off, since it
 * does not face the unit (§9.1.5). A unit on open ground otherwise is left
 * two equally small retreats, a 45° turn either way and a step (§9.1.3) —
 * the tie its owner chooses between.
 *
 * @param unit - The unit whose straight retreat is barred, and where it stands
 * @returns An unengaged enemy in the space behind it, facing away from it
 * @throws Error when the unit's back is against the board edge
 */
export function enemyBlockingStraightBack(
  unit: UnitWithPlacement,
): UnitWithPlacement {
  // The same space as an enemy that would cut the retreat, turned about.
  const facingIt = enemyCuttingOffRetreat(unit);
  const facingAway: UnitWithPlacement = {
    ...facingIt,
    placement: {
      ...facingIt.placement,
      facing: getOppositeFacing(facingIt.placement.facing),
    },
  };
  return facingAway;
}
