import type { PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import {
  findStepFacing,
  getDiagonalCornerSpaces,
  isDiagonalFacing,
} from '@queries';
import { canMoveThrough } from './canMoveThrough';

/**
 * The corner test for a diagonal step (§5.4.5): the unit must be able to
 * pass through at least one of the two orthogonal spaces flanking the
 * diagonal — you cannot slip between two units standing corner to corner.
 *
 * The test looks only at those two corner spaces, never at the space the
 * step enters. What the unit may do at the target — rest there, pass
 * through, or engage an enemy standing on it (§6.2.1) — is the caller's
 * question, which is what lets a diagonal step end on an enemy.
 *
 * @param unitSide - The side of the unit attempting to move
 * @param currentUnitFlexibility - The flexibility of the unit attempting to move
 * @param gameState - The current game state
 * @param currentCoordinate - The current position
 * @param targetCoordinate - The target diagonal space
 * @returns Whether the diagonal step passes the corner test
 * @throws Error when the two spaces are not diagonal neighbours
 */
export function checkDiagonalMove(
  unitSide: PlayerSide,
  currentUnitFlexibility: number,
  gameState: GameState,
  currentCoordinate: Coordinate,
  targetCoordinate: Coordinate,
): boolean {
  // The corners are read from the board the step is taken on.
  const board = gameState.boardState;

  // A step goes straight ahead (§5.1.3), so the two spaces fix its facing.
  // Only a diagonal step has corners to pass between; asking of any other
  // is a fault in the caller, not a rule.
  const currentFacing = findStepFacing(
    board,
    currentCoordinate,
    targetCoordinate,
  );
  if (currentFacing === undefined) {
    throw new Error('The two spaces are not neighbours');
  }

  // A straight step has no corner to cut, so asking of one is the caller's
  // fault.
  const isDiagonalFacingResult = isDiagonalFacing(currentFacing);
  if (!isDiagonalFacingResult) {
    throw new Error('The step is not diagonal');
  }

  // The two corner spaces the step cuts between, read by position.
  const corners = getDiagonalCornerSpaces(
    board,
    currentCoordinate,
    targetCoordinate,
  );

  // Filter out spaces that we can't move through
  // Each corner is asked the mover's own pass-through question (§5.4.1 to
  // §5.4.4): an enemy, an engaged space, or a friend too stiff to pass all
  // shut that corner. This is the mover's stricter test; support and
  // commanders ask only whether enemies hold both corners (§2.4.4). Terrain
  // will be paid on the corner the mover chooses (§5.5.3); it is not read yet
  // (RULEBOOK appendix A3).
  const validPassThroughSpaces = corners.filter((space) =>
    canMoveThrough(unitSide, currentUnitFlexibility, space, gameState),
  );

  // The step is possible if at least one corner lets the unit slip past.
  // The target space itself is deliberately not asked about here: testing
  // it with the pass-through rule was what made an enemy on the diagonal
  // unreachable, because an enemy can be engaged but never passed through.
  const canMakeDiagonalMove = validPassThroughSpaces.length > 0;
  return canMakeDiagonalMove;
}
