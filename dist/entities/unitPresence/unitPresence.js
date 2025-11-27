import { z } from "zod";
import { engagedUnitPresenceSchema } from "./engagedUnitPresence.js";
import { noneUnitPresenceSchema } from "./noneUnitPresence.js";
import { singleUnitPresenceSchema } from "./singleUnitPresence.js";
/**
 * The schema for unit presence in a space.
 */
export const unitPresenceSchema = z.discriminatedUnion("presenceType", [
    noneUnitPresenceSchema,
    singleUnitPresenceSchema,
    engagedUnitPresenceSchema,
]);
const _assertExactUnitPresence = true;
