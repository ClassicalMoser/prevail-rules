import type { Board, Coordinate, PlayerSide } from '@entities';
import { getBoardSpace } from '@queries';
export function addCommanderToBoard(
  board: Board,
  playerSide: PlayerSide,
  coordinate: Coordinate,
): Board {
  const space = getBoardSpace(board, coordinate);
  const existingCommanders = space.commanders;
  const newCommanders = [...existingCommanders, playerSide];
  const newSpace = {
    ...space,
    commanders: newCommanders,
  };
  const newBoard = {
    ...board,
    board: {
      ...board.board,
      [coordinate]: newSpace,
    },
  };
  return newBoard;
}
