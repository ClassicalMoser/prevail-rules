import type { StandardBoardCoordinate, UnitFacing } from "src/entities/index.js";
/**
 * Get the spaces ahead for a given coordinate and facing.
 * This includes all spaces on the board in front of the facing's inline spaces.
 * @param coordinate - The coordinate to get the spaces ahead for
 * @param facing - The facing to get the spaces ahead for
 * @returns A set of the space coordinates
 * (all spaces on the board in front of the facing's inline spaces)
 */
export declare const getSpacesAhead: (coordinate: StandardBoardCoordinate, facing: UnitFacing) => Set<StandardBoardCoordinate>;
//# sourceMappingURL=getSpacesAhead.d.ts.map