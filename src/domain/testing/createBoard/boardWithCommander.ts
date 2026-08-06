import type { PlayerSide, Board, Coordinate } from '@entities';
import { addCommanderToBoard, createEmptyStandardBoard } from '@transforms';

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
  return addCommanderToBoard(targetBoard, playerSide, coordinate);
}
