import type { MoveContext } from './moveContext';
import type { MoveResult } from './moveResult';
import type { MoveState } from './moveState';
import { createUnitPlacement } from '@factories';
import { canMoveInto } from '../passage';
import { getEngagementEndFacing } from '../engaging';
import { isWithinMoveBounds } from './isWithinMoveBounds';

/**
 * Whether the move may end at this point, and if so, the placement it ends
 * on and what it cost. A move may stop anywhere its rules allow, not only
 * where its allowances run out.
 *
 * @param context - What the whole move is bound by
 * @param state - The point in the move being considered as its end
 * @returns The ending, or `undefined` when the move may not end here
 */
export function findMoveEnding(
  context: MoveContext,
  state: MoveState,
): MoveResult | undefined {
  // What the move has spent to reach this point. A retreat is judged by
  // these (§9.1.3), and an advance offers the smallest way to each ending.
  const speedUsed = context.totalSpeed - state.remainingSpeed;
  const flexibilityUsed = context.totalFlexibility - state.remainingFlexibility;

  // On the start space. Standing in place, turned or not, is a legal
  // advance: the unit's own space needs no one's permission. A retreat must
  // actually fall back (§9.1.2), and a unit that has walked away and come
  // back has gained nothing it could not have by standing still.
  if (state.coordinate === context.start.coordinate) {
    if (context.direction !== 'advance' || speedUsed > 0) {
      // A retreat that has not fallen back, or a walk that came home.
      return undefined;
    }
    const standing: MoveResult = {
      flexibilityUsed,
      path: state.path,
      placement: createUnitPlacement(state.coordinate, state.facing),
      speedUsed,
    };

    // An order to stand, or to turn on the spot, is a real move (§5.5
    // edge case): the unit still counts as commanded.
    return standing;
  }

  // Elsewhere, the ground decides (§5.3): open ground may be rested on, a
  // friend's space only passed through, an enemy's space entered only as an
  // engagement legal from the space the step left (§6.2). A retreat must
  // also end behind its starting rank (§9.1.2).
  const mayEndHere =
    canMoveInto(
      context.unitSide,
      context.gameState.boardState,
      state.coordinate,
      state.cameFrom,
      context.start.coordinate,
      state.remainingFlexibility,
      context.direction,
    ) && isWithinMoveBounds(context, state.coordinate);
  if (!mayEndHere) {
    // A friend's space, an engaged one, an engagement the approach does not
    // allow, or ground outside a retreat's bounds.
    return undefined;
  }

  // An engaging move from the front squares up head-on as it closes, and
  // that turn is part of this move and spends its point (§6.2.3). This is
  // what keeps every engagement square, flank, or rear — never 45° off
  // (§6.3.1). Open ground keeps the facing the step arrived on. Whether the
  // point is there to spend was settled above: `canEngageEnemy`, inside
  // `canMoveInto`, refuses a front approach that cannot afford the turn.
  const engagementEnd = getEngagementEndFacing(
    context.gameState.boardState,
    state.coordinate,
    state.cameFrom,
  );
  const endFacing = engagementEnd?.facing ?? state.facing;
  // The squaring turn is written into the path like any other turn, so the
  // event records the whole motion and costs its point.
  const squaringTurn = engagementEnd?.squaringTurn ?? null;
  const path =
    squaringTurn === null ? state.path : [...state.path, squaringTurn];
  const squaringCost = squaringTurn === null ? 0 : 1;

  // The ending as the walk and the offers report it: where the unit ends,
  // how it faces, the path to submit, and the cost with the squaring turn.
  const ending: MoveResult = {
    flexibilityUsed: flexibilityUsed + squaringCost,
    path,
    placement: createUnitPlacement(state.coordinate, endFacing),
    speedUsed,
  };

  // A legal place for the move to stop.
  return ending;
}
