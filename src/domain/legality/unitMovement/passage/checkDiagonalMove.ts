import type { Coordinate, PlayerSide } from '@entities';
import type { GameState } from '@game';
import {
  getAdjacentFacings,
  getForwardSpace,
  getStepFacing,
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
  const board = gameState.boardState;
  // A step goes straight ahead (§5.1.3), so the two spaces fix its facing.
  // Only a diagonal step has corners to pass between; asking of any other
  // is a fault in the caller, not a rule.
  const currentFacing = getStepFacing(
    board,
    currentCoordinate,
    targetCoordinate,
  );
  if (currentFacing === undefined) {
    throw new Error('The two spaces are not neighbours');
  }
  const { result: isDiagonalFacingResult } = isDiagonalFacing(currentFacing);
  if (!isDiagonalFacingResult) {
    throw new Error('The step is not diagonal');
  }

  // Get adjacent facings (orthogonal directions)
  const adjacentFacings = getAdjacentFacings(currentFacing);

  // Get the orthogonal pass-through spaces for each adjacent facing
  const orthogonalPassThroughSpaces: Coordinate[] = Array.from(
    adjacentFacings,
    (adjacentFacing) =>
      getForwardSpace(board, currentCoordinate, adjacentFacing),
  ).filter((space) => space !== undefined);

  // Filter out spaces that we can't move through
  const validPassThroughSpaces = orthogonalPassThroughSpaces.filter((space) =>
    canMoveThrough(unitSide, currentUnitFlexibility, space, gameState),
  );

  // The step is possible if at least one corner lets the unit slip past.
  // The target space itself is deliberately not asked about here: testing
  // it with the pass-through rule was what made an enemy on the diagonal
  // unreachable, because an enemy can be engaged but never passed through
  // (A12).
  const canMakeDiagonalMove = validPassThroughSpaces.length > 0;
  return canMakeDiagonalMove;
}
