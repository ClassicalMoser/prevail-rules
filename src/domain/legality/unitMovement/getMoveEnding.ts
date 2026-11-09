import type { MoveContext } from './moveContext';
import type { MoveResult } from './moveResult';
import type { MoveState } from './moveState';
import { canMoveInto } from './canMoveInto';
import { getEngagementEndFacing } from './getEngagementEndFacing';
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
export function getMoveEnding(
  context: MoveContext,
  state: MoveState,
): MoveResult | undefined {
  const speedUsed = context.totalSpeed - state.remainingSpeed;
  const flexibilityUsed = context.totalFlexibility - state.remainingFlexibility;

  // On the start space. Standing in place, turned or not, is a legal
  // advance: the unit's own space needs no one's permission. A retreat must
  // actually fall back (§9.1.2), and a unit that has walked away and come
  // back has gained nothing it could not have by standing still.
  if (state.coordinate === context.start.coordinate) {
    if (context.direction !== 'advance' || speedUsed > 0) {
      return undefined;
    }
    const standing: MoveResult = {
      flexibilityUsed,
      placement: { coordinate: state.coordinate, facing: state.facing },
      speedUsed,
    };
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
      state.facing,
      state.remainingFlexibility,
      context.direction,
    ) && isWithinMoveBounds(context, state.coordinate);
  if (!mayEndHere) {
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
    state.facing,
  );
  const endFacing = engagementEnd?.facing ?? state.facing;
  const squaringCost = engagementEnd?.flexibilitySpent ?? 0;

  const ending: MoveResult = {
    flexibilityUsed: flexibilityUsed + squaringCost,
    placement: { coordinate: state.coordinate, facing: endFacing },
    speedUsed,
  };
  return ending;
}
