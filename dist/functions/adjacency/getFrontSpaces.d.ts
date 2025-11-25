import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
/**
 * Get the front spaces for a given coordinate and facing, including diagonals
 * @param coordinate - The coordinate to get the front spaces for
 * @param facing - The facing to get the front spaces for
 * @returns A set of the front space coordinates (up to 3 spaces, including diagonals)
 */
export declare const getFrontSpaces: (coordinate: StandardBoardCoordinate, facing: UnitFacing) => Set<StandardBoardCoordinate>;
//# sourceMappingURL=getFrontSpaces.d.ts.map