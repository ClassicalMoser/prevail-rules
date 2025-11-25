import { z } from "zod";
/**
 * List of valid facing directions for a unit.
 */
export const unitFacings = [
  "north",
  "northEast",
  "east",
  "southEast",
  "south",
  "southWest",
  "west",
  "northWest",
];
/**
 * The schema for the facing direction of a unit.
 */
export const unitFacingSchema = z.enum(unitFacings);
const _assertExactUnitFacing = true;
