import type { BoardSpace, Modifier, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { getBoardSpace, hasSingleUnit, isSameUnitInstance } from '@queries';
import type { MoveResult } from './explore';
import { exploreUnitMoves } from './explore';
import { getSmallestMovePerEnding } from './size';

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

  // TODO(composition): the three checks below ask by hand whether this unit
  // stands alone at this placement, as `isAtPlacement` (for retreats) and
  // `isSameUnitWithPlacement` also do. They differ in their messages and in
  // refusing an engaged unit. Settled with those two marks: one getter that
  // throws, compared through `isSameUnitWithPlacement`.

  // The move is read from the board the unit stands on.
  // Get the board state
  const board = gameState.boardState;
  // The reported starting position must be a valid board space
  const boardSpace: BoardSpace = getBoardSpace(
    board,
    startingPosition.coordinate,
  );
  // Check if the unit is free to move
  // A unit locked in an engagement cannot be ordered (§4.3.4, §6.1.2), and an
  // empty space has no one to order: either way the caller has asked a
  // question the game never puts.
  if (!hasSingleUnit(boardSpace.unitPresence)) {
    throw new Error('No movable unit at starting position');
  }
  // Check if the reported unit is present at the starting position
  // A move is worked out for the unit chosen to act (§4.3.10), named by who
  // it is; another unit on that space means a stale or forged request.
  const sameUnit = isSameUnitInstance(boardSpace.unitPresence.unit, unit);
  if (!sameUnit) {
    throw new Error('Unit is not present at the starting position');
  }
  // Check if the reported facing is valid
  // Every step goes the way the unit faces (§5.1.3), so a move worked out
  // from the wrong facing would walk somewhere the unit cannot.
  if (boardSpace.unitPresence.facing !== startingPosition.facing) {
    throw new Error('Reported facing is inaccurate');
  }

  // Every ending of an ordered advance, by every path the walk finds to it.
  const everyPath = exploreUnitMoves(
    gameState,
    unitWithPlacement,
    'advance',
    commitmentModifiers,
  );

  // One way to each ending, the plainest: where the move ends is what the
  // player chooses, and what it leaves unspent is never read again. A longer
  // legal path is still accepted when a player submits it, part by part
  // (`findLegalMoveDeltas`).
  const plainest = getSmallestMovePerEnding(everyPath);

  // The endings travel as a set: their order means nothing in the game
  // (`listMovesInBoardOrder` fixes one for the wire).
  const legalMoves = new Set(plainest);
  return legalMoves;
}
