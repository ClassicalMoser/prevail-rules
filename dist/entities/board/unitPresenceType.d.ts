import { z } from "zod";
/**
 * List of valid unit presence types.
 */
export declare const unitPresenceType: readonly ["none", "single", "engaged"];
/**
 * The schema for the type of unit presence in a space.
 */
export declare const unitPresenceTypeSchema: z.ZodEnum<["none", "single", "engaged"]>;
/**
 * The type of unit presence in a space.
 */
export type UnitPresenceType = (typeof unitPresenceType)[number];
//# sourceMappingURL=unitPresenceType.d.ts.map