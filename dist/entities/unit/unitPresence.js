import { z } from "zod";
import { unitFacingSchema } from "./unitFacing.js";
import { unitInstanceSchema } from "./unitInstance.js";
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
const _assertExactUnitPresence = true;
