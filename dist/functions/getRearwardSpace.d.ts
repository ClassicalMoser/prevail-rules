import type { Board, BoardCoordinate } from "../entities/board/board.js";
import type { UnitFacing } from "../entities/unit/unitFacing.js";
/**
 * Get the rearward space for a given coordinate and facing.
 * This is the space directly behind the given coordinate in the given facing direction.
 *
 * @param board - The board object
 * @param coordinate - The coordinate to get the rearward space for
 * @param facing - The facing to get the rearward space for
 * @returns The coordinate of the rearward space
 * (directly behind the given coordinate in the given facing direction)
 * or undefined if the space is out of bounds
 */
export declare function getRearwardSpace(board: Board, coordinate: BoardCoordinate<Board>, facing: UnitFacing): BoardCoordinate<Board> | undefined;
//# sourceMappingURL=getRearwardSpace.d.ts.map