import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { Board, BoardCoordinate } from "../../entities/board/board.js";
/**
 * Get the inline spaces for a given coordinate and facing,
 * continuing in a straight line to the left and right of the facing.
 * This includes the origin space.
 * @param board - The board object
 * @param coordinate - The coordinate to get the inline spaces for
 * @param facing - The facing to get the inline spaces for
 * @returns A set of the inline space coordinates
 * (unlimited, straight line to the left and right, including the origin space)
 */
export declare function getInlineSpaces(
  board: Board,
  coordinate: BoardCoordinate<Board>,
  facing: UnitFacing,
): Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getInlineSpaces.d.ts.map
