import type { AssertExact } from "../../utils/assertExact.js";
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
] as const;

/**
 * The schema for the facing direction of a unit.
 */
export const unitFacingSchema = z.enum(unitFacings);

// Helper type to check match of type against schema
type unitFacingSchemaType = z.infer<typeof unitFacingSchema>;

/**
 * The facing direction of a unit.
 */
export type UnitFacing = (typeof unitFacings)[number];

const _assertExactUnitFacing: AssertExact<UnitFacing, unitFacingSchemaType> =
  true;
