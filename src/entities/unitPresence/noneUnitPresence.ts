import type { AssertExact } from "../../utils/assertExact.js";
import { z } from "zod";

/**
 * The schema for no unit presence in a space.
 */
export const noneUnitPresenceSchema = z.object({
  /** No unit is present in the space. */
  presenceType: z.literal("none" as const),
});

// Helper type to check match of type against schema
type NoneUnitPresenceSchemaType = z.infer<typeof noneUnitPresenceSchema>;

/**
 * No unit is present in the space.
 */
export interface NoneUnitPresence {
  /** No unit is present in the space. */
  presenceType: "none";
}

const _assertExactNoneUnitPresence: AssertExact<
  NoneUnitPresence,
  NoneUnitPresenceSchemaType
> = true;
