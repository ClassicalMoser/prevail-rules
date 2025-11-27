import { z } from "zod";
import { unitFacingSchema } from "../unit/unitFacing.js";
import { unitInstanceSchema } from "../unit/unitInstance.js";
import { unitPresenceType } from "./unitPresenceType.js";
/**
 * The schema for two units engaged in combat in a space.
 */
export const engagedUnitPresenceSchema = z.object({
    /** Two units are engaged in combat in the space. */
    presenceType: z.literal(unitPresenceType[2]),
    /** The primary unit in the engagement. */
    primaryUnit: unitInstanceSchema,
    /** The facing direction of the primary unit. */
    primaryFacing: unitFacingSchema,
    /** The secondary unit in the engagement (facing opposite the primary unit). */
    secondaryUnit: unitInstanceSchema,
});
const _assertExactEngagedUnitPresence = true;
