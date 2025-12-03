import type { EngagedUnitPresence } from "@entities/unitPresence/engagedUnitPresence.js";
import type { NoneUnitPresence } from "@entities/unitPresence/noneUnitPresence.js";
import type { SingleUnitPresence } from "@entities/unitPresence/singleUnitPresence.js";
import type { AssertExact } from "@utils/assertExact.js";
import { engagedUnitPresenceSchema } from "@entities/unitPresence/engagedUnitPresence.js";
import { noneUnitPresenceSchema } from "@entities/unitPresence/noneUnitPresence.js";
import { singleUnitPresenceSchema } from "@entities/unitPresence/singleUnitPresence.js";
import { z } from "zod";

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
