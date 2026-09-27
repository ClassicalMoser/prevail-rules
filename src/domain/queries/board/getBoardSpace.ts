import type { Board, BoardSpace, Coordinate } from '@entities';

/**
 * Gets the board space at the given coordinate.
 *
 * Indexes `board.board` (a partial record). Throws if the coordinate is absent —
 * e.g. out of bounds for this board size, or an incomplete board object.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the space for
 * @returns The board space at the coordinate
 * @throws {Error} If the coordinate doesn't exist on the board
 *
 * @example
 * ```typescript
 * const board: Board = createEmptyStandardBoard();
 * const space = getBoardSpace(board, 'E-5');
 * ```
 */
export function getBoardSpace(
  board: Board,
  coordinate: Coordinate,
): BoardSpace {
  const space = board.board[coordinate];

  if (space === undefined) {
    throw new Error(
      `Coordinate ${coordinate} does not exist on ${board.boardType} board.`,
    );
  }

  return space;
}
