import { createUnitPlacement } from '@factories';
import {
  findForwardSpace,
  findRearwardSpace,
  isDiagonalFacing,
} from '@queries';
import type { MoveContext } from './moveContext';
import type { MoveState } from './moveState';
import { canMoveThrough, checkDiagonalMove } from '../passage';
import { isPositionHeld } from './isPositionHeld';
import { isWithinMoveBounds } from './isWithinMoveBounds';

/**
 * The single step a unit may take from this point in its move, for
 * 1 Speed: into the space it faces when advancing, or the space behind it
 * when retreating (§5.1.2–§5.1.3, §9.1.1). A unit never steps sideways;
 * to go elsewhere it turns first.
 *
 * A step back onto a position the move already held is not offered
 * (§5.2.4).
 *
 * The step is offered with whether the move may go on from the space it
 * enters. A space the unit cannot pass through — an enemy, most
 * importantly — still ends the move legally if the ending rules allow it,
 * so the step is not refused; it is marked as the last.
 *
 * @param context - What the whole move is bound by
 * @param state - The point in the move the step would be taken from
 * @returns The state after the step and whether the move may continue from it; `undefined` when no step is possible
 */
export function getStepOption(
  context: MoveContext,
  state: MoveState,
): { next: MoveState; mayContinue: boolean } | undefined {
  // Every step costs a point of Speed.
  if (state.remainingSpeed === 0) {
    // With none left the unit may still turn, but not step.
    return undefined;
  }

  // A retreat moves rearward, away from the facing; an advance follows it.
  const getSpaceInDirection =
    context.direction === 'advance' ? findForwardSpace : findRearwardSpace;
  const board = context.gameState.boardState;
  const nextCoordinate = getSpaceInDirection(
    board,
    state.coordinate,
    state.facing,
  );
  // The board edge is the end of the world in that direction.
  if (nextCoordinate === undefined) {
    // No step off the board.
    return undefined;
  }

  // A step may not bring the move back to a position it held: that space,
  // facing this way (§5.2.4).
  if (isPositionHeld(state, nextCoordinate, state.facing)) {
    // The move would come back to where it already stood, facing this way.
    return undefined;
  }

  // A diagonal step must pass between the two corner spaces flanking the
  // diagonal (§5.4.5): no slipping between two units standing corner to
  // corner. Whether the step may then end on the space is not this test's
  // question — that is how a diagonal step can still engage an enemy.
  // An orthogonal step has no corners to pass between, and the corner test
  // is asked only of a diagonal one. The friend's half of the test uses the
  // unit's Flexibility for the whole move, not what is left of it (§5.4.2).
  const isDiagonal = isDiagonalFacing(state.facing);
  const cornersOpen =
    !isDiagonal ||
    checkDiagonalMove(
      context.unitSide,
      context.totalFlexibility,
      context.gameState,
      state.coordinate,
      nextCoordinate,
    );
  if (!cornersOpen) {
    // Both corner spaces shut: the step cannot be taken at all.
    return undefined;
  }

  // The move goes on only through ground it may cross (§5.4) and, for a
  // retreat, only behind its starting rank (§9.1.2).
  // As in the corner test, a friend is passed by the whole move's
  // Flexibility (§5.4.2).
  const mayContinue =
    canMoveThrough(
      context.unitSide,
      context.totalFlexibility,
      nextCoordinate,
      context.gameState,
    ) && isWithinMoveBounds(context, nextCoordinate);

  // The unit on the next space, facing as it did, a point of Speed spent,
  // and this position held from now on.
  const next: MoveState = {
    cameFrom: state.coordinate,
    coordinate: nextCoordinate,
    facing: state.facing,
    heldPositions: [
      ...state.heldPositions,
      createUnitPlacement(nextCoordinate, state.facing),
    ],
    path: [...state.path, 'step'],
    remainingFlexibility: state.remainingFlexibility,
    remainingSpeed: state.remainingSpeed - 1,
  };
  const option = { mayContinue, next };

  // The walk goes on from `next` when it may continue; otherwise it may only
  // end there (`findMoveEnding`).
  return option;
}
