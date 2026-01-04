import type {
  Board,
  BoardCoordinate,
  BoardSpace,
  GameState,
  UnitInstance,
  UnitPlacement,
} from '@entities';
import { getBoardSpace, getForwardSpace } from '@queries/boardSpace';
import { areSameSide } from '@queries/unit';
import { canEngageEnemy, canMoveInto, hasSingleUnit } from '@validation';
import { exploreMoves } from './exploreMoves';

/**
 * Calculates all legal moves for a unit from a given starting position.
 * Uses recursive exploration with memoization to find all combinations of
 * movement and facing changes within the unit's speed and flexibility limits.
 *
 * This function explores all possible move sequences by:
 * 1. Moving forward (consuming speed)
 * 2. Changing facing (consuming flexibility)
 * 3. Combining both in any order
 *
 * The algorithm uses memoization to avoid revisiting the same state
 * (coordinate + facing + remaining speed + remaining flexibility).
 *
 * @param unit - The unit for which to calculate legal moves
 * @param gameState - The current game state
 * @param startingPosition - The current position and facing of the unit
 * @returns A set of all legal unit placements (coordinate + facing) the unit can reach
 * @throws {Error} If the unit is not free to move, not present, or facing mismatch
 */
export function getLegalUnitMoves<TBoard extends Board>(
  unit: UnitInstance,
  gameState: GameState<TBoard>,
  startingPosition: UnitPlacement<TBoard>,
): Set<UnitPlacement<TBoard>> {
  // Get the board state
  const board = gameState.boardState;
  // The reported starting position must be a valid board space
  const boardSpace: BoardSpace = getBoardSpace(
    board,
    startingPosition.coordinate,
  );
  // Check if the unit is free to move
  if (!hasSingleUnit(boardSpace.unitPresence)) {
    throw new Error('Unit at starting position is not free to move');
  }
  // Check if the reported unit is present at the starting position
  if (boardSpace.unitPresence.unit !== unit) {
    throw new Error('Unit is not present at the starting position');
  }
  // Check if the reported facing is valid
  if (boardSpace.unitPresence.facing !== startingPosition.facing) {
    throw new Error('Reported facing is inaccurate');
  }
  // Get the legal moves by exploring all combinations of speed and flexibility
  const legalMoves = new Set<UnitPlacement<TBoard>>();

  const canEndAt = (
    u: UnitInstance,
    b: TBoard,
    coord: BoardCoordinate<TBoard>,
  ) => {
    // Starting position is always valid (staying in place)
    if (coord === startingPosition.coordinate) {
      return true;
    }
    return canMoveInto(u, b, coord);
  };

  const onValidDestination = (
    placement: UnitPlacement<TBoard>,
    flexibilityUsed: number,
    speedUsed: number,
    previousCoordinate: BoardCoordinate<TBoard> | undefined,
    remainingFlexibility: number,
  ) => {
    // Check if this is an enemy space that requires engagement validation
    const currentSpace = getBoardSpace(board, placement.coordinate);
    const isEnemySpace =
      hasSingleUnit(currentSpace.unitPresence) &&
      !areSameSide(currentSpace.unitPresence.unit, unit);

    if (isEnemySpace && previousCoordinate !== undefined) {
      // Check enemy engagement rules if moving into an enemy space
      if (
        canEngageEnemy(
          unit,
          board,
          placement.coordinate,
          placement.facing,
          previousCoordinate,
          remainingFlexibility,
          startingPosition.coordinate,
        )
      ) {
        legalMoves.add(placement);
      }
    } else {
      // Not an enemy space - no engagement checks needed
      legalMoves.add(placement);
    }
  };

  exploreMoves(unit, gameState, startingPosition, {
    getSpaceInDirection: getForwardSpace,
    canEndAt,
    onValidDestination,
  });

  return legalMoves;
}
