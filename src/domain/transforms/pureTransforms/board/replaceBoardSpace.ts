import type { Board, BoardSpace } from '@entities';
import type { Coordinate } from '@ruleValues';

/**
 * A board with one space replaced, every other space as it was. Units and
 * commanders are set down and lifted off one space at a time, so each of
 * their board writers ends here.
 *
 * @param board - The board as it was
 * @param coordinate - The space that changes
 * @param space - What that space now holds
 * @returns A new board with that space replaced
 */
export function replaceBoardSpace(
  board: Board,
  coordinate: Coordinate,
  space: BoardSpace,
): Board {
  // Only that one space changes; the rest of the board is as it was.
  const spaces = { ...board.board, [coordinate]: space };
  const newBoard = { ...board, board: spaces };

  // The board with the space replaced.
  return newBoard;
}
