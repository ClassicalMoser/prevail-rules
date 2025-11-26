import type { AssertExact } from "../../utils/assertExact.js";
import type { EngagedUnitPresence } from "./engagedUnitPresence.js";
import type { NoneUnitPresence } from "./noneUnitPresence.js";
import type { SingleUnitPresence } from "./singleUnitPresence.js";
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

// Helper type to check match of type against schema
type UnitPresenceTypeSchemaType = z.infer<typeof unitPresenceSchema>;

/**
 * Unit presence in a space.
 */
export type UnitPresence =
  | NoneUnitPresence
  | SingleUnitPresence
  | EngagedUnitPresence;

const _assertExactUnitPresence: AssertExact<
  UnitPresence,
  UnitPresenceTypeSchemaType
> = true;
