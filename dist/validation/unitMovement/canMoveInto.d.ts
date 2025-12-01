import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { Board, UnitInstance } from "src/entities/index.js";
/**
 * Determines whether a unit can move into (end its movement at) a specific coordinate.
 *
 * @param unit - The unit attempting to move
 * @param board - The board state
 * @param coordinate - The coordinate to check
 * @returns True if the unit can end its movement at this coordinate, false otherwise
 */
export declare function canMoveInto<TBoard extends Board>(unit: UnitInstance, board: TBoard, coordinate: BoardCoordinate<TBoard>): boolean;
//# sourceMappingURL=canMoveInto.d.ts.map