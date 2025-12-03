import type {
  EngagedUnitPresence,
  NoneUnitPresence,
  SingleUnitPresence,
} from "@entities";
import type { AssertExact } from "@utils";
import {
  engagedUnitPresenceSchema,
  noneUnitPresenceSchema,
  singleUnitPresenceSchema,
} from "@entities";
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
