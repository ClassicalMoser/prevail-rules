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
  const targetBoard = board ?? createEmptyStandardBoard();
  const withCommander = addCommanderToBoard(
    targetBoard,
    playerSide,
    coordinate,
  );
  return withCommander;
}
