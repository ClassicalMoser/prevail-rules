import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { BoardSpace } from "src/entities/board/boardSpace.js";
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
export declare function getBoardSpace<TBoard extends Board>(board: TBoard, coordinate: BoardCoordinate<TBoard>): BoardSpace;
//# sourceMappingURL=getBoardSpace.d.ts.map