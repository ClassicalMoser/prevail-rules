import type { Board, BoardCoordinate, BoardSpace, PlayerSide } from '@entities';
import { getBoardSpace } from '@queries';
/* Pure transform to remove a commander from the board immutably with no side effects. */
export function removeCommanderFromBoard<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  playerSide: PlayerSide,
): TBoard {
  const space = getBoardSpace(board, coordinate);
  const existingCommanders = space.commanders;
  if (!existingCommanders.includes(playerSide)) {
    throw new Error('Commander not present to remove');
  }
  const newCommanders = [...existingCommanders].filter(
    (commander) => commander !== playerSide,
  );
  const newSpace: BoardSpace = {
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
