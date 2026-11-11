import {
  findForwardSpace,
  findRearwardSpace,
  isDiagonalFacing,
} from '@queries';
import type { MoveContext } from './moveContext';
import type { MoveState } from './moveState';
import { canMoveThrough, checkDiagonalMove } from '../passage';
import { isWithinMoveBounds } from './isWithinMoveBounds';

/**
 * The single step a unit may take from this point in its move, for
 * 1 Speed: into the space it faces when advancing, or the space behind it
 * when retreating (§5.1.2–§5.1.3, §9.1.1). A unit never steps sideways;
 * to go elsewhere it turns first.
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
    return undefined;
  }

  // A diagonal step must pass between the two corner spaces flanking the
  // diagonal (§5.4.5): no slipping between two units standing corner to
  // corner. Whether the step may then end on the space is not this test's
  // question — that is how a diagonal step can still engage an enemy.
  const { result: isDiagonal } = isDiagonalFacing(state.facing);
  if (
    isDiagonal &&
    !checkDiagonalMove(
      context.unitSide,
      context.totalFlexibility,
      context.gameState,
      state.coordinate,
      nextCoordinate,
    )
  ) {
    return undefined;
  }

  // The move goes on only through ground it may cross (§5.4) and, for a
  // retreat, only behind its starting rank (§9.1.2).
  const mayContinue =
    canMoveThrough(
      context.unitSide,
      context.totalFlexibility,
      nextCoordinate,
      context.gameState,
    ) && isWithinMoveBounds(context, nextCoordinate);

  const next: MoveState = {
    cameFrom: state.coordinate,
    coordinate: nextCoordinate,
    facing: state.facing,
    path: [...state.path, 'step'],
    remainingFlexibility: state.remainingFlexibility,
    remainingSpeed: state.remainingSpeed - 1,
  };
  const option = { mayContinue, next };
  return option;
}
