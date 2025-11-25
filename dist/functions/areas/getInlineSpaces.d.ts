import type { StandardBoardCoordinate, UnitFacing } from "src/entities/index.js";
/**
 * Get the inline spaces for a given coordinate and facing,
 * continuing in a straight line to the left and right of the facing.
 * This includes the origin space.
 * @param coordinate - The coordinate to get the inline spaces for
 * @param facing - The facing to get the inline spaces for
 * @returns A set of the inline space coordinates
 * (unlimited, straight line to the left and right, including the origin space)
 */
export declare const getInlineSpaces: (coordinate: StandardBoardCoordinate, facing: UnitFacing) => Set<StandardBoardCoordinate>;
//# sourceMappingURL=getInlineSpaces.d.ts.map