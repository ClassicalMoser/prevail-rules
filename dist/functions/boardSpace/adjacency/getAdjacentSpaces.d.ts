import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
/**
 * Get the adjacent spaces for a given coordinate.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the adjacent spaces for
 * @returns A set of the adjacent space coordinates (up to 8 spaces)
 */
export declare function getAdjacentSpaces(board: Board, coordinate: BoardCoordinate<Board>): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getAdjacentSpaces.d.ts.map