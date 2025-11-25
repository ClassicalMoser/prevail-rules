import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { Board, BoardCoordinate } from "../../entities/board/board.js";
/**
 * Get the flanking spaces for a given coordinate and facing,
 * the spaces directly to the right and left of the facing
 * @param board - The board object
 * @param coordinate - The coordinate to get the flanking spaces for
 * @param facing - The facing to get the flanking spaces for
 * @returns A set of the flanking space coordinates (up to 2 spaces, directly to the right and left)
 */
export declare function getFlankingSpaces(board: Board, coordinate: BoardCoordinate<Board>, facing: UnitFacing): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getFlankingSpaces.d.ts.map