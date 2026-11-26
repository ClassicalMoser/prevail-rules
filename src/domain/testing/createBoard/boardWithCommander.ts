import type { PlayerSide, Board } from '@entities';
import type { Coordinate } from '@ruleValues';
import { addCommanderToBoard } from '@transforms';
import { createEmptyStandardBoard } from '@factories';

/**
 * Creates a board with a commander at a coordinate.
 * Composes the pure transform addCommanderToBoard.
 */
export function createBoardWithCommander(
  playerSide: PlayerSide,
  coordinate: Coordinate,
  board?: Board,
): Board {
  // The spec's own board, so its units stay where it put them; otherwise an
  // empty standard board.
  const targetBoard = board ?? createEmptyStandardBoard();

  // The commander stands on the space, which is where every inspiration
  // range on its side's cards is measured from (§4.2.7).
  const withCommander = addCommanderToBoard(
    targetBoard,
    playerSide,
    coordinate,
  );

  // The board with that commander on it, and nothing else changed.
  return withCommander;
}
