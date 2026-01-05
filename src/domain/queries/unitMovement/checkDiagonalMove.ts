import type {
  Board,
  BoardCoordinate,
  GameState,
  UnitFacing,
  UnitInstance,
} from '@entities';
import { getForwardSpace } from '@queries/boardSpace';
import { getAdjacentFacings } from '@queries/facings';
import { canMoveThrough, isDiagonalFacing } from '@validation';

/**
 * Checks if a unit can make a diagonal move through the target space.
 * Diagonal moves require passing through at least one adjacent orthogonal space.
 *
 * This function only checks if the unit can continue moving through the target.
 * Whether the unit can end at the target should be checked separately by the caller.
 *
 * @param unit - The unit attempting to move
 * @param gameState - The current game state
 * @param currentCoordinate - The current position
 * @param targetCoordinate - The target diagonal space
 * @param facing - The facing direction (must be diagonal)
 * @returns Whether the unit can continue moving through the target space
 */
export function checkDiagonalMove<TBoard extends Board>(
  unit: UnitInstance,
  gameState: GameState<TBoard>,
  currentCoordinate: BoardCoordinate<TBoard>,
  targetCoordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing,
): boolean {
  // Get the board state
  const board = gameState.boardState;
  // Check if the facing is diagonal
  if (!isDiagonalFacing(facing)) {
    throw new Error('Facing must be diagonal');
  }

  // Get adjacent facings (orthogonal directions)
  const adjacentFacings = getAdjacentFacings(facing);

  // Get the orthogonal pass-through spaces for each adjacent facing
  const orthogonalPassThroughSpaces: BoardCoordinate<TBoard>[] = Array.from(
    adjacentFacings,
  )
    .map((adjacentFacing) =>
      getForwardSpace(board, currentCoordinate, adjacentFacing),
    )
    .filter((space) => space !== undefined);

  // Filter out spaces that we can't move through
  const validPassThroughSpaces = orthogonalPassThroughSpaces.filter((space) =>
    canMoveThrough(unit, space, gameState),
  );

  // We can make a diagonal move if we can pass through any of the adjacent orthogonal spaces
  const canMakeDiagonalMove = validPassThroughSpaces.length > 0;

  // Can continue if we can move through the target and have a valid pass-through space
  return (
    canMoveThrough(unit, targetCoordinate, gameState) && canMakeDiagonalMove
  );
}
