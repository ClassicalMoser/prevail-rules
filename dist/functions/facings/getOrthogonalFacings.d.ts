import type { UnitFacing } from "../../entities/unit/unitFacing.js";
/**
 * Get the orthogonal facings for a given facing.
 * These are the two facings perpendicular to the given facing.
 * @param facing - The facing to get the orthogonal facings for
 * @returns A set of the two orthogonal facings (90 degrees away from the given facing)
 */
export declare const getOrthogonalFacings: (
  facing: UnitFacing,
) => Set<UnitFacing>;
//# sourceMappingURL=getOrthogonalFacings.d.ts.map
