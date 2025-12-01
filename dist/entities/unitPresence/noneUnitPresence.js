import { z } from "zod";
/**
 * The schema for no unit presence in a space.
 */
export const noneUnitPresenceSchema = z.object({
    /** No unit is present in the space. */
    presenceType: z.literal("none"),
});
const _assertExactNoneUnitPresence = true;
