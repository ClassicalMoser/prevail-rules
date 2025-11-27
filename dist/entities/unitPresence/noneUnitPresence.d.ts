import { z } from "zod";
/**
 * The schema for no unit presence in a space.
 */
export declare const noneUnitPresenceSchema: z.ZodObject<{
    /** No unit is present in the space. */
    presenceType: z.ZodLiteral<"none">;
}, "strip", z.ZodTypeAny, {
    presenceType: "none";
}, {
    presenceType: "none";
}>;
/**
 * No unit is present in the space.
 */
export interface NoneUnitPresence {
    /** No unit is present in the space. */
    presenceType: "none";
}
//# sourceMappingURL=noneUnitPresence.d.ts.map