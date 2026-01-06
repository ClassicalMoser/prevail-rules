import type {
  Board,
  BoardSpace,
  GameState,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import { getBoardSpace } from '@queries/boardSpace';
import { hasSingleUnit, isSameUnitInstance } from '@validation';
import { exploreUnitMoves } from './exploreUnitMoves';

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
 * @param unitWithPlacement - The unit and its starting position for which to calculate legal moves
 * @param gameState - The current game state
 * @returns A set of all legal unit placements (coordinate + facing) the unit can reach
 * @throws {Error} If the unit is not free to move, not present, or facing mismatch
 */
export function getLegalUnitMoves<TBoard extends Board>(
  unitWithPlacement: UnitWithPlacement<TBoard>,
  gameState: GameState<TBoard>,
): Set<UnitPlacement<TBoard>> {
  const { unit, placement: startingPosition } = unitWithPlacement;
  // Get the board state
  const board = gameState.boardState;
  // The reported starting position must be a valid board space
  const boardSpace: BoardSpace = getBoardSpace(
    board,
    startingPosition.coordinate,
  );
  // Check if the unit is free to move
  if (!hasSingleUnit(boardSpace.unitPresence)) {
    throw new Error('No movable unit at starting position');
  }
  // Check if the reported unit is present at the starting position
  const sameUnit = isSameUnitInstance(boardSpace.unitPresence.unit, unit);
  if (!sameUnit) {
    throw new Error('Unit is not present at the starting position');
  }
  // Check if the reported facing is valid
  if (boardSpace.unitPresence.facing !== startingPosition.facing) {
    throw new Error('Reported facing is inaccurate');
  }

  // Get the legal moves by exploring all combinations of speed and flexibility
  const legalMoves = exploreUnitMoves(gameState, unitWithPlacement, 'advance');

  // Convert the move results to final placements
  const legalPlacements = new Set<UnitPlacement<TBoard>>(
    Array.from(legalMoves).map((result) => result.placement),
  );

  return legalPlacements;
}
