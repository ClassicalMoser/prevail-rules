import type { Board, BoardCoordinate, PlayerSide } from '@entities';
import { getBoardSpace } from '@queries';

/* Pure transform to remove a commander from the board immutably with no side effects. */
export function removeCommanderFromBoard<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
  playerSide: PlayerSide,
): TBoard {
  const space = getBoardSpace(board, coordinate);
  const existingCommanders = space.commanders;
  if (!existingCommanders.has(playerSide)) {
    throw new Error('Commander not present to remove');
  }
  const newCommanders = new Set(
    [...existingCommanders].filter((commander) => commander !== playerSide),
  );
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
