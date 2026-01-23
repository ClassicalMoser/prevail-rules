import type { Board, BoardCoordinate, PlayerSide } from '@entities';
import { getBoardSpace } from '@queries';

export function addCommanderToBoard<TBoard extends Board>(
  board: TBoard,
  playerSide: PlayerSide,
  coordinate: BoardCoordinate<TBoard>,
): TBoard {
  const space = getBoardSpace(board, coordinate);
  const existingCommanders = space.commanders;
  const newCommanders = new Set([...existingCommanders, playerSide]);
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
