import type { PlayerSide, StandardBoard, StandardBoardCoordinate } from "@entities";
import { addCommanderToBoard, createEmptyStandardBoard } from "@transforms";

/**
 * Creates a board with a commander at a coordinate.
 * Composes the pure transform addCommanderToBoard.
 */
export function createBoardWithCommander(
  playerSide: PlayerSide,
  coordinate: StandardBoardCoordinate,
  board?: StandardBoard,
): StandardBoard {
  const targetBoard = board ?? createEmptyStandardBoard();
  return addCommanderToBoard(targetBoard, playerSide, coordinate);
}
