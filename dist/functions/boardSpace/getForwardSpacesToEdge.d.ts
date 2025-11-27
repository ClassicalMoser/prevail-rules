import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
/**
 * Get the forward spaces to the edge for a given coordinate and facing.
 * This includes all spaces on the board ina direct line from the given coordinate in the given facing direction.
 * @param board - The board object (used to infer coordinate type)
 * @param coordinate - The coordinate to get the forward spaces to the edge for
 * @param facing - The facing to get the forward spaces to the edge for
 * @returns A set of the space coordinates
 * (all spaces on the board in a direct line from the given coordinate in the given facing direction)
 */
export declare const getForwardSpacesToEdge: (board: Board, coordinate: BoardCoordinate<Board>, facing: UnitFacing) => Set<BoardCoordinate<Board>>;
//# sourceMappingURL=getForwardSpacesToEdge.d.ts.map