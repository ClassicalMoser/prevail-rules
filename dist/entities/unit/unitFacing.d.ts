import { z } from "zod";
/** List of orthogonal facings. */
export declare const orthogonalFacings: readonly ["north", "east", "south", "west"];
/** List of diagonal facings. */
export declare const diagonalFacings: readonly ["northEast", "southEast", "southWest", "northWest"];
/**
 * List of valid facing directions for a unit.
 */
export declare const unitFacings: readonly ["north", "east", "south", "west", "northEast", "southEast", "southWest", "northWest"];
/**
 * The schema for the facing direction of a unit.
 */
export declare const unitFacingSchema: z.ZodEnum<["north", "east", "south", "west", "northEast", "southEast", "southWest", "northWest"]>;
/**
 * The facing direction of a unit.
 */
export type UnitFacing = (typeof unitFacings)[number];
//# sourceMappingURL=unitFacing.d.ts.map