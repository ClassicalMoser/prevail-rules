import type { StandardBoardCoordinate } from "src/entities/board/standardBoard/standardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
/**
 * Get the flanking spaces for a given coordinate and facing,
 * the spaces directly to the right and left of the facing
 * @param coordinate - The coordinate to get the flanking spaces for
 * @param facing - The facing to get the flanking spaces for
 * @returns A set of the flanking space coordinates (up to 2 spaces, directly to the right and left)
 */
export declare const getFlankingSpaces: (coordinate: StandardBoardCoordinate, facing: UnitFacing) => Set<StandardBoardCoordinate>;
//# sourceMappingURL=getFlankingSpaces.d.ts.map