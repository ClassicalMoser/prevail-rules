import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { Board, BoardCoordinate } from "../../../entities/board/board.js";
/**
 * Get the spaces ahead for a given coordinate and facing.
 * This includes all spaces on the board in front of the facing's inline spaces.
 * @param board - The board object
 * @param coordinate - The coordinate to get the spaces ahead for
 * @param facing - The facing to get the spaces ahead for
 * @returns A set of the space coordinates
 * (all spaces on the board in front of the facing's inline spaces)
 */
export declare function getSpacesAhead(board: Board, coordinate: BoardCoordinate<Board>, facing: UnitFacing): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getSpacesAhead.d.ts.map