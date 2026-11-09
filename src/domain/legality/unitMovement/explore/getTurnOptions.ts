import type { UnitFacing } from '@entities';
import { getAdjacentFacings, getFacingsOneTurnAway } from '@queries';
import type { MoveContext } from './moveContext';
import type { MoveState } from './moveState';

/**
 * The facings a unit may turn to from this point in its move, each for
 * 1 Flexibility. Ordinarily that is 45° either way or about (§5.2.1), as
 * often as the allowance lasts (§5.2.2).
 *
 * A retreat's opening is the one exception: before its first step back it
 * may turn at most 45° in all and never about (§9.1.4) — a retreat does not
 * begin by facing the enemy's way. After the first step, the ordinary rule
 * applies.
 *
 * @param context - What the whole move is bound by
 * @param state - The point in the move the turn would be made from
 * @returns The facings one turn from here may end on; empty when no turn is allowed
 */
export function getTurnOptions(
  context: MoveContext,
  state: MoveState,
): Set<UnitFacing> {
  // Every turn costs a point; with none left, the unit holds its facing.
  if (state.remainingFlexibility === 0) {
    const none = new Set<UnitFacing>();
    return none;
  }

  // Still on the start space means no step back has been taken yet.
  const isRetreatOpening =
    context.direction === 'retreat' &&
    state.coordinate === context.start.coordinate;
  if (!isRetreatOpening) {
    const ordinary = getFacingsOneTurnAway(state.facing);
    return ordinary;
  }

  // The opening allows 45° in all, so once the facing has left the one the
  // retreat began with, that allowance is spent: a second turn would stack
  // to 90°.
  if (state.facing !== context.start.facing) {
    const spent = new Set<UnitFacing>();
    return spent;
  }
  const opening = getAdjacentFacings(context.start.facing);
  return opening;
}
