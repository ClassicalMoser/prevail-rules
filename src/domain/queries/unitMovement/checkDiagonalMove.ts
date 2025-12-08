import type {
  Board,
  BoardCoordinate,
  UnitFacing,
  UnitInstance,
} from '@entities';
import { getAdjacentFacings } from '@queries/facings';
import { canMoveThrough, isDiagonalFacing } from '@validation';

/**
 * Result of checking if a diagonal move is possible and what the unit can do.
 */
export interface DiagonalMoveCheck {
  /** Whether the unit can continue moving through this space */
  canContinue: boolean;
  /** Whether the unit can end its movement at this space */
  canEnd: boolean;
}

/**
 * Checks if a unit can make a diagonal move and what it can do at the destination.
 * Diagonal moves require passing through adjacent orthogonal spaces.
 *
 * @param unit - The unit attempting to move
 * @param board - The board state
 * @param currentCoordinate - The current position
 * @param targetCoordinate - The target diagonal space
 * @param facing - The facing direction (must be diagonal)
 * @param getSpaceInDirection - Function to get the space in a given direction (forward or backward)
 * @param canMoveIntoTarget - Function to check if unit can end at target (varies by move type)
 * @returns Whether the unit can continue through or end at the target
 */
export function checkDiagonalMove<TBoard extends Board>(
  unit: UnitInstance,
  board: TBoard,
  currentCoordinate: BoardCoordinate<TBoard>,
  targetCoordinate: BoardCoordinate<TBoard>,
  facing: UnitFacing,
  getSpaceInDirection: (
    board: TBoard,
    coordinate: BoardCoordinate<TBoard>,
    facing: UnitFacing,
  ) => BoardCoordinate<TBoard> | undefined,
  canMoveIntoTarget: (
    unit: UnitInstance,
    board: TBoard,
    coordinate: BoardCoordinate<TBoard>,
  ) => boolean,
): DiagonalMoveCheck {
  if (!isDiagonalFacing(facing)) {
    throw new Error('Facing must be diagonal');
  }

  // Get adjacent facings (orthogonal directions)
  const adjacentFacings = getAdjacentFacings(facing);

  // Get the orthogonal pass-through spaces for each adjacent facing
  const orthogonalPassThroughSpaces = Array.from(adjacentFacings)
    .map((facing) => getSpaceInDirection(board, currentCoordinate, facing))
    .filter((space) => space !== undefined) as BoardCoordinate<TBoard>[];

  // Filter out spaces that we can't move through
  const validPassThroughSpaces = orthogonalPassThroughSpaces.filter((space) =>
    canMoveThrough(unit, board, space),
  );

  // We can make a diagonal move if we can pass through any of the adjacent orthogonal spaces
  const canMakeDiagonalMove = validPassThroughSpaces.length > 0;

  const canContinue =
    canMoveThrough(unit, board, targetCoordinate) && canMakeDiagonalMove;
  const canEnd =
    canMoveIntoTarget(unit, board, targetCoordinate) && canMakeDiagonalMove;

  return { canContinue, canEnd };
}
