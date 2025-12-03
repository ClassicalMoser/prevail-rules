import type { AssertExact } from "@utils";
import { z } from "zod";

/**
 * List of valid unit presence types.
 */
export const unitPresenceType = ["none", "single", "engaged"] as const;

/**
 * The schema for the type of unit presence in a space.
 */
export const unitPresenceTypeSchema = z.enum(unitPresenceType);

// Helper type to check match of type against schema
type UnitPresenceTypeSchemaType = z.infer<typeof unitPresenceTypeSchema>;

/**
 * The type of unit presence in a space.
 */
export type UnitPresenceType = (typeof unitPresenceType)[number];

const _assertExactUnitPresenceType: AssertExact<
  UnitPresenceType,
  UnitPresenceTypeSchemaType
> = true;
