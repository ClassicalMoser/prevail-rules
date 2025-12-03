import type { UnitFacing } from "@entities/unit/unitFacing.js";
import type { UnitInstance } from "@entities/unit/unitInstance.js";
import type { AssertExact } from "@utils/assertExact.js";
import { unitFacingSchema } from "@entities/unit/unitFacing.js";
import { unitInstanceSchema } from "@entities/unit/unitInstance.js";
import { z } from "zod";

/**
 * The schema for a single unit presence in a space.
 */
export const singleUnitPresenceSchema = z.object({
  /** A single unit is present in the space. */
  presenceType: z.literal("single" as const),
  /** The unit in the space. */
  unit: unitInstanceSchema,
  /** The facing direction of the unit. */
  facing: unitFacingSchema,
});

// Helper type to check match of type against schema
type SingleUnitPresenceSchemaType = z.infer<typeof singleUnitPresenceSchema>;

/**
 * A single unit is present in the space.
 */
export interface SingleUnitPresence {
  /** A single unit is present in the space. */
  presenceType: "single";
  /** The unit in the space. */
  unit: UnitInstance;
  /** The facing direction of the unit. */
  facing: UnitFacing;
}

const _assertExactSingleUnitPresence: AssertExact<
  SingleUnitPresence,
  SingleUnitPresenceSchemaType
> = true;
