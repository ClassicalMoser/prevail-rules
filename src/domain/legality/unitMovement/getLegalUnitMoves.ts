import type { BoardSpace, Modifier, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { getBoardSpace, hasSingleUnit, isSameUnitInstance } from '@queries';
import type { MoveResult } from './explore';
import { exploreUnitMoves } from './explore';

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
 * @param commitmentModifiers - What a card committed for this move adds (§4.3.10), if one was
 * @returns Every legal ending the unit can reach, each with its cost and a path a player can submit to make it
 * @throws {Error} If the unit is not free to move, not present, or facing mismatch
 */
export function getLegalUnitMoves(
  unitWithPlacement: UnitWithPlacement,
  gameState: GameState,
  commitmentModifiers?: Modifier[],
): Set<MoveResult> {
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
  const sameUnit = isSameUnitInstance(
    boardSpace.unitPresence.unit,
    unit,
  ).result;
  if (!sameUnit) {
    throw new Error('Unit is not present at the starting position');
  }
  // Check if the reported facing is valid
  if (boardSpace.unitPresence.facing !== startingPosition.facing) {
    throw new Error('Reported facing is inaccurate');
  }

  // Every ending of an ordered advance, each with the path that reaches it.
  // Two paths to one placement are offered separately: they cost
  // differently, and the player chooses (A11).
  const legalMoves = exploreUnitMoves(
    gameState,
    unitWithPlacement,
    'advance',
    commitmentModifiers,
  );
  return legalMoves;
}
