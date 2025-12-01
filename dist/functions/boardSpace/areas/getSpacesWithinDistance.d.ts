import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
/**
 * Get all spaces within a given distance from a coordinate.
 * Uses breadth-first traversal to find all spaces within the distance.
 * @param board - The board object
 * @param coordinate - The starting coordinate
 * @param distance - The maximum distance (inclusive)
 * @returns A set of all space coordinates within the distance
 */
export declare function getSpacesWithinDistance(board: Board, coordinate: BoardCoordinate<Board>, distance: number): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getSpacesWithinDistance.d.ts.map