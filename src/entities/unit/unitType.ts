import type { Trait } from "@sampleValues/traits.js";
import type { AssertExact } from "@utils/assertExact.js";
import { traitSchema } from "@sampleValues/traits.js";
import { z } from "zod";

/**
 * The schema for a unit of troops.
 * A unit is the atomic element of an army in this game.
 */
export const unitTypeSchema = z.object({
  /** Not sure yet how the units will be identified,
   * but we need to have a unique identifier for each unit type.
   */
  id: z.string(),
  /** The name of the unit, capitalized with spaces. */
  name: z.string(),
  /** The traits of the unit. */
  traits: z.array(traitSchema),
  /** The attack strength of the unit. */
  attack: z.number().int().min(1).max(5),
  /** The normal attack range of the unit. */
  range: z.number().int().min(0).max(5),
  /** The maximum movement speed of the unit. */
  speed: z.number().int().min(1).max(5),
  /** The flexibility value of the unit. */
  flexibility: z.number().int().min(0).max(5),
  /** The attack value required to reverse the unit. */
  reverse: z.number().int().min(0).max(10),
  /** The attack value required to retreat the unit. */
  retreat: z.number().int().min(0).max(10),
  /** The attack value required to rout the unit. */
  rout: z.number().int().min(0).max(10),
  /** The cost of the unit. */
  cost: z.number().int().min(5).max(100),
  /** The limit of units that can be included in a standard army. */
  limit: z.number().int().min(1).max(20),
  /** The number of cards the owner must discard when the unit is routed. */
  routPenalty: z.number().int().min(0).max(5),
});

// Helper type to check match of type against schema
type UnitTypeSchemaType = z.infer<typeof unitTypeSchema>;

/**
 * A unit of troops.
 * A unit is the atomic element of an army in this game.
 */
export interface UnitType {
  /** The unique identifier of the unit. */
  id: string;
  /** The capitalized name of the unit. */
  name: string;
  /** The traits of the unit. */
  traits: Trait[];
  /** The attack strength of the unit. */
  attack: number;
  /** The normal attack range of the unit. */
  range: number;
  /** The maximum movement speed of the unit. */
  speed: number;
  /** The flexibility value of the unit. */
  flexibility: number;
  /** The attack value required to reverse the unit. */
  reverse: number;
  /** The attack value required to retreat the unit. */
  retreat: number;
  /** The attack value required to rout the unit. */
  rout: number;
  /** The cost of the unit. */
  cost: number;
  /** The limit of units that can be included in a standard army. */
  limit: number;
  /** The number of cards the owner must discard when the unit is routed. */
  routPenalty: number;
}

/** Helper function to assert that a value matches the schema. */
const _assertExactUnitType: AssertExact<UnitType, UnitTypeSchemaType> = true;
