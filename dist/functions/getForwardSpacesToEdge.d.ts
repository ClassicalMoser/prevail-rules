import type { StandardBoardCoordinate, UnitFacing } from "src/entities/index.js";
/**
 * Get the forward spaces to the edge for a given coordinate and facing.
 * This includes all spaces on the board ina direct line from the given coordinate in the given facing direction.
 * @param coordinate - The coordinate to get the forward spaces to the edge for
 * @param facing - The facing to get the forward spaces to the edge for
 * @returns A set of the space coordinates
 * (all spaces on the board in a direct line from the given coordinate in the given facing direction)
 */
export declare const getForwardSpacesToEdge: (coordinate: StandardBoardCoordinate, facing: UnitFacing) => Set<StandardBoardCoordinate>;
//# sourceMappingURL=getForwardSpacesToEdge.d.ts.map