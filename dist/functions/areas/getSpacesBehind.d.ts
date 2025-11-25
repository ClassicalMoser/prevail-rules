import type { StandardBoardCoordinate, UnitFacing } from "src/entities/index.js";
/**
 * Get the spaces behind for a given coordinate and facing.
 * This includes all spaces on the board behind the facing's inline spaces.
 * @param coordinate - The coordinate to get the spaces behind for
 * @param facing - The facing to get the spaces behind for
 * @returns A set of the space coordinates
 * (all spaces on the board behind the facing's inline spaces)
 */
export declare const getSpacesBehind: (coordinate: StandardBoardCoordinate, facing: UnitFacing) => Set<StandardBoardCoordinate>;
//# sourceMappingURL=getSpacesBehind.d.ts.map