import type { AssertExact } from "../../utils/assertExact.js";
import type { UnitFacing } from "./unitFacing.js";
import type { UnitType } from "./unitType.js";
import { z } from "zod";
import { unitFacingSchema } from "./unitFacing.js";
import { unitPresenceType } from "./unitPresenceType.js";
import { unitTypeSchema } from "./unitType.js";

/**
 * The schema for unit presence in a space.
 */
export const unitPresenceSchema = z.discriminatedUnion("presenceType", [
  /** No unit is present in the space. */
  z.object({ presenceType: z.literal(unitPresenceType[0]) }),
  /** A single unit is present in the space. */
  z.object({
    presenceType: z.literal(unitPresenceType[1]),
    /** The facing direction of the unit. */
    facing: unitFacingSchema,
  }),
  /** Two units are engaged in combat in the space. */
  z.object({
    presenceType: z.literal(unitPresenceType[2]),
    /** The primary unit in the engagement. */
    primaryUnit: unitTypeSchema,
    /** The facing direction of the primary unit. */
    primaryFacing: unitFacingSchema,
    /** The secondary unit in the engagement (facing opposite the primary unit). */
    secondaryUnit: unitTypeSchema,
  }),
]);

type UnitPresenceFromSchema = z.infer<typeof unitPresenceSchema>;

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
      /** The facing direction of the unit. */
      facing: UnitFacing;
    }
  | {
      /** Two units are engaged in combat in the space. */
      presenceType: "engaged";
      /** The primary unit in the engagement. */
      primaryUnit: UnitType;
      /** The facing direction of the primary unit. */
      primaryFacing: UnitFacing;
      /** The secondary unit in the engagement (facing opposite the primary unit). */
      secondaryUnit: UnitType;
    };

const _assertExactUnitPresence: AssertExact<
  UnitPresence,
  UnitPresenceFromSchema
> = true;
