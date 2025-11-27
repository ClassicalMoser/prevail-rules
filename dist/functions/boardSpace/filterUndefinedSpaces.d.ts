import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
/**
 * Filter out undefined spaces from a set of space coordinates.
 * @param spaces - The set of space coordinates to filter
 * @returns A set of the space coordinates with undefined values removed
 */
export declare function filterUndefinedSpaces(spaces: Set<BoardCoordinate<Board> | undefined>): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=filterUndefinedSpaces.d.ts.map