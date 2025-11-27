import { z } from "zod";
import { unitFacingSchema } from "../unit/unitFacing.js";
import { unitInstanceSchema } from "../unit/unitInstance.js";
import { unitPresenceType } from "./unitPresenceType.js";
/**
 * The schema for a single unit presence in a space.
 */
export const singleUnitPresenceSchema = z.object({
    /** A single unit is present in the space. */
    presenceType: z.literal(unitPresenceType[1]),
    /** The unit in the space. */
    unit: unitInstanceSchema,
    /** The facing direction of the unit. */
    facing: unitFacingSchema,
});
const _assertExactSingleUnitPresence = true;
