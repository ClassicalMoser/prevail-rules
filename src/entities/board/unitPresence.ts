import type { AssertExact } from "../../utils/assertExact.js";
import type { UnitFacing } from "../unit/unitFacing.js";
import type { UnitInstance } from "../unit/unitInstance.js";
import { z } from "zod";
import { unitFacingSchema } from "../unit/unitFacing.js";
import { unitInstanceSchema } from "../unit/unitInstance.js";
import { unitPresenceType } from "./unitPresenceType.js";

/**
 * The schema for unit presence in a space.
 */
export const unitPresenceSchema = z.discriminatedUnion("presenceType", [
  /** No unit is present in the space. */
  z.object({ presenceType: z.literal(unitPresenceType[0]) }),
  /** A single unit is present in the space. */
  z.object({
    presenceType: z.literal(unitPresenceType[1]),
    /** The unit in the space. */
    unit: unitInstanceSchema,
    /** The facing direction of the unit. */
    facing: unitFacingSchema,
  }),
  /** Two units are engaged in combat in the space. */
  z.object({
    presenceType: z.literal(unitPresenceType[2]),
    /** The primary unit in the engagement. */
    primaryUnit: unitInstanceSchema,
    /** The facing direction of the primary unit. */
    primaryFacing: unitFacingSchema,
    /** The secondary unit in the engagement (facing opposite the primary unit). */
    secondaryUnit: unitInstanceSchema,
  }),
]);

// Helper type to check match of type against schema
type UnitPresenceTypeSchemaType = z.infer<typeof unitPresenceSchema>;

/**
 * Unit presence in a space.
 */
export type UnitPresence =
  | {
      /** No unit is present in the space. */
      presenceType: "none";
    }
  | {
      /** A single unit is present in the space. */
      presenceType: "single";
      /** The unit in the space. */
      unit: UnitInstance;
      /** The facing direction of the unit. */
      facing: UnitFacing;
    }
  | {
      /** Two units are engaged in combat in the space. */
      presenceType: "engaged";
      /** The primary unit in the engagement. */
      primaryUnit: UnitInstance;
      /** The facing direction of the primary unit. */
      primaryFacing: UnitFacing;
      /** The secondary unit in the engagement (facing opposite the primary unit). */
      secondaryUnit: UnitInstance;
    };

const _assertExactUnitPresence: AssertExact<
  UnitPresence,
  UnitPresenceTypeSchemaType
> = true;
