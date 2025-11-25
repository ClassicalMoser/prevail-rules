import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { Board, BoardCoordinate } from "../../entities/board/board.js";
/**
 * Get the front spaces for a given coordinate and facing, including diagonals
 * @param board - The board object
 * @param coordinate - The coordinate to get the front spaces for
 * @param facing - The facing to get the front spaces for
 * @returns A set of the front space coordinates (up to 3 spaces, including diagonals)
 */
export declare function getFrontSpaces(board: Board, coordinate: BoardCoordinate<Board>, facing: UnitFacing): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getFrontSpaces.d.ts.map