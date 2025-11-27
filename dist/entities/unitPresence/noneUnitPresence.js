import { z } from "zod";
import { unitPresenceType } from "./unitPresenceType.js";
/**
 * The schema for no unit presence in a space.
 */
export const noneUnitPresenceSchema = z.object({
    /** No unit is present in the space. */
    presenceType: z.literal(unitPresenceType[0]),
});
const _assertExactNoneUnitPresence = true;
