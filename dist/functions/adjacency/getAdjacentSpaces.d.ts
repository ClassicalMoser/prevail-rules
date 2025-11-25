import type { Board, BoardCoordinate } from "../../entities/board/board.js";
/**
 * Get the adjacent spaces for a given coordinate.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the adjacent spaces for
 * @returns A set of the adjacent space coordinates (up to 8 spaces)
 */
export declare function getAdjacentSpaces(board: Board, coordinate: BoardCoordinate<Board>): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getAdjacentSpaces.d.ts.map