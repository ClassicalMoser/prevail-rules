import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
/**
 * Get the spaces behind for a given coordinate and facing.
 * This includes all spaces on the board behind the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces behind for
 * @param facing - The facing to get the spaces behind for
 * @returns A set of the space coordinates
 * (all spaces on the board behind the facing's inline spaces)
 */
export declare function getSpacesBehind(board: Board, coordinate: BoardCoordinate<Board>, facing: UnitFacing): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getSpacesBehind.d.ts.map