import type { Coordinate, PlayerSide, UnitFacing } from '@entities';
import type { GameState } from '@game';
import {
  getAdjacentFacings,
  getForwardSpace,
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
 * @param currentFacing - The facing direction (must be diagonal)
 * @returns Whether the diagonal step passes the corner test
 */
export function checkDiagonalMove(
  unitSide: PlayerSide,
  currentUnitFlexibility: number,
  gameState: GameState,
  currentCoordinate: Coordinate,
  targetCoordinate: Coordinate,
  currentFacing: UnitFacing,
): boolean {
  // Get the board state
  const board = gameState.boardState;
  // Check if the facing is diagonal
  const { result: isDiagonalFacingResult } = isDiagonalFacing(currentFacing);
  if (!isDiagonalFacingResult) {
    throw new Error('Facing must be diagonal');
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
