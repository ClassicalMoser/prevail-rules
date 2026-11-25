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
  // The space itself: its ground, its corners, and who stands there.
  const space = board.board[coordinate];

  // Every space of this size is on the board, so a missing one is a name
  // from a larger board or a board built short, and asking is a fault.
  if (space === undefined) {
    throw new Error(
      `Coordinate ${coordinate} does not exist on ${board.boardType} board.`,
    );
  }

  // The space, for its ground and whoever stands on it.
  return space;
}
