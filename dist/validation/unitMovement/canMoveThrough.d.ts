import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { Board, UnitInstance } from "src/entities/index.js";
/**
 * Determines whether a unit can move through (pass over) a specific coordinate.
 * Requires combined flexibility >= MIN_FLEXIBILITY_THRESHOLD for friendly units.
 *
 * @param unit - The unit attempting to move through
 * @param board - The board state
 * @param coordinate - The coordinate to check
 * @returns True if the unit can pass through this coordinate, false otherwise
 */
export declare function canMoveThrough<TBoard extends Board>(unit: UnitInstance, board: TBoard, coordinate: BoardCoordinate<TBoard>): boolean;
//# sourceMappingURL=canMoveThrough.d.ts.map