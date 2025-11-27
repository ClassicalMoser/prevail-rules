import type { AssertExact } from "../../utils/assertExact.js";
import type { UnitFacing } from "../unit/unitFacing.js";
import type { UnitInstance } from "../unit/unitInstance.js";
import { z } from "zod";
import { unitFacingSchema } from "../unit/unitFacing.js";
import { unitInstanceSchema } from "../unit/unitInstance.js";

/**
 * The schema for two units engaged in combat in a space.
 */
export const engagedUnitPresenceSchema = z.object({
  /** Two units are engaged in combat in the space. */
  presenceType: z.literal("engaged" as const),
  /** The primary unit in the engagement. */
  primaryUnit: unitInstanceSchema,
  /** The facing direction of the primary unit. */
  primaryFacing: unitFacingSchema,
  /** The secondary unit in the engagement (facing opposite the primary unit). */
  secondaryUnit: unitInstanceSchema,
});

// Helper type to check match of type against schema
type EngagedUnitPresenceSchemaType = z.infer<typeof engagedUnitPresenceSchema>;

/**
 * Two units are engaged in combat in the space.
 */
export interface EngagedUnitPresence {
  /** Two units are engaged in combat in the space. */
  presenceType: "engaged";
  /** The primary unit in the engagement. */
  primaryUnit: UnitInstance;
  /** The facing direction of the primary unit. */
  primaryFacing: UnitFacing;
  /** The secondary unit in the engagement (facing opposite the primary unit). */
  secondaryUnit: UnitInstance;
}

const _assertExactEngagedUnitPresence: AssertExact<
  EngagedUnitPresence,
  EngagedUnitPresenceSchemaType
> = true;
