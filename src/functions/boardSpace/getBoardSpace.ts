import type { Board, BoardCoordinate, BoardSpace } from "@entities";

/**
 * Gets the board space at the given coordinate.
 *
 * This helper function encapsulates the type-safe access pattern for getting
 * a board space from a generic board type. It ensures that the board type
 * and coordinate type are properly aligned using TypeScript generics.
 *
 * The generic constraint `TBoard extends Board` combined with `BoardCoordinate<TBoard>`
 * ensures that only valid coordinate types can be used with their corresponding
 * board types at compile time.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the space for (must match board type)
 * @returns The board space at the coordinate
 * @throws {Error} If the coordinate doesn't exist on the board
 *
 * @example
 * ```typescript
 * // ✅ Type-safe: coordinate matches board type
 * const standardBoard: StandardBoard = createEmptyStandardBoard();
 * const space = getBoardSpace(standardBoard, "E-5");
 *
 * // ❌ Type error: wrong coordinate type
 * const smallCoord: SmallBoardCoordinate = "A-1";
 * const space = getBoardSpace(standardBoard, smallCoord); // TypeScript error!
 * ```
 *
 * @example
 * ```typescript
 * // Works with any board type
 * function processBoard<TBoard extends Board>(board: TBoard, coord: BoardCoordinate<TBoard>) {
 *   const space = getBoardSpace(board, coord); // Type-safe!
 *   // ...
 * }
 * ```
 */
export function getBoardSpace<TBoard extends Board>(
  board: TBoard,
  coordinate: BoardCoordinate<TBoard>
): BoardSpace {
  // TypeScript needs help here: we know TBoard and BoardCoordinate<TBoard> align,
  // but the union type of board.board prevents direct indexing.
  // The generic constraint ensures type safety at compile time.
  const space = board.board[coordinate as keyof typeof board.board];

  // If the space is undefined, the coordinate does not exist on the board.
  if (space === undefined) {
    throw new Error(
      `Coordinate ${coordinate} does not exist on ${board.boardType} board.`
    );
  }

  // Return the space.
  return space;
}
