import type { UnitFacing } from "../../entities/unit/unitFacing.js";
/**
 * Get the adjacent facings for a given facing.
 * These are the two facings 45 degrees away from the given facing.
 * @param facing - The facing to get the adjacent facings for
 * @returns A set of the two adjacent facings (45 degrees away from the given facing)
 */
export declare const getAdjacentFacings: (
  facing: UnitFacing,
) => Set<UnitFacing>;
//# sourceMappingURL=getAdjacentFacings.d.ts.map
