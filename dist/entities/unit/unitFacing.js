import { z } from "zod";
/** List of orthogonal facings. */
export const orthogonalFacings = ["north", "east", "south", "west"];
/** List of diagonal facings. */
export const diagonalFacings = [
    "northEast",
    "southEast",
    "southWest",
    "northWest",
];
/**
 * List of valid facing directions for a unit.
 */
export const unitFacings = [...orthogonalFacings, ...diagonalFacings];
/**
 * The schema for the facing direction of a unit.
 */
export const unitFacingSchema = z.enum(unitFacings);
const _assertExactUnitFacing = true;
