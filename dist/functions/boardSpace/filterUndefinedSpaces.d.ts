import type { Board, BoardCoordinate } from "../../entities/board/board.js";
/**
 * Filter out undefined spaces from a set of space coordinates.
 * @param spaces - The set of space coordinates to filter
 * @returns A set of the space coordinates with undefined values removed
 */
export declare function filterUndefinedSpaces(spaces: Set<BoardCoordinate<Board> | undefined>): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=filterUndefinedSpaces.d.ts.map