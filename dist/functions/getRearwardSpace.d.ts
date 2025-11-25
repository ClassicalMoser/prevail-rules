import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
/**
 * Get the rearward space for a given coordinate and facing.
 * This is the space directly behind the given coordinate in the given facing direction.
 * @param coordinate - The coordinate to get the rearward space for
 * @param facing - The facing to get the rearward space for
 * @returns The coordinate of the rearward space
 * (directly behind the given coordinate in the given facing direction)
 * or undefined if the space is out of bounds
 */
export declare const getRearwardSpace: (coordinate: StandardBoardCoordinate, facing: UnitFacing) => StandardBoardCoordinate | undefined;
//# sourceMappingURL=getRearwardSpace.d.ts.map