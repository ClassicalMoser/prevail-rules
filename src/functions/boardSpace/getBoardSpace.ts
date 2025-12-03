import type { Board } from "@entities/board/board.js";
import type { BoardCoordinate } from "@entities/board/boardCoordinates.js";
import type { BoardSpace } from "@entities/board/boardSpace.js";

/**
 * Gets the board space at the given coordinate.
 *
 * This helper function encapsulates the type-safe access pattern for getting
 * a board space from a generic board type. It ensures that the board type
 * and coordinate type are properly aligned.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the space for
 * @returns The board space at the coordinate
 * @throws {Error} If the coordinate doesn't exist on the board
 *
 * @example
 * const board: StandardBoard = ...;
 * const space = getBoardSpace(board, "E-5");
 */
export function getBoardSpace<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>,
): BoardSpace {
  // TypeScript needs help here: we know TBoard and BoardCoordinate<TBoard> align,
  // but the union type of board.board prevents direct indexing.
  // The generic constraint ensures type safety at compile time.
  const space = board.board[coordinate as keyof typeof board.board];

  // If the space is undefined, the coordinate does not exist on the board.
  if (space === undefined) {
    throw new Error(
      `Coordinate ${coordinate} does not exist on ${board.boardType} board.`,
    );
  }

  // Return the space.
  return space;
}
