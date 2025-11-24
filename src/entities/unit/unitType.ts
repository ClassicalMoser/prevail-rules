import type { AssertExact } from "../../assertExact.js";
import { z } from "zod";

/**
 * The schema for a unit of troops.
 */
export const unitTypeSchema = z.object({
  id: z.string(),
  // The capitalized name of the unit.
  name: z.string(),
  // The traits of the unit.
  traits: z.array(z.string()),
  // The attack strength of the unit.
  attack: z.number().min(1).max(5),
  // The normal attack range of the unit.
  range: z.number().min(0).max(5),
  // The maximum movement speed of the unit.
  speed: z.number().min(1).max(5),
  // The flexibility value of the unit.
  flexibility: z.number().min(0).max(5),
  // The attack value required to reverse the unit.
  reverse: z.number().min(0).max(10),
  // The attack value required to retreat the unit.
  retreat: z.number().min(0).max(10),
  // The attack value required to defeat the unit.
  defeat: z.number().min(0).max(10),
  // The cost of the unit.
  cost: z.number().min(5).max(100),
  // The limit of units that can be included in a standard army.
  limit: z.number().min(1).max(20),
});

// Helper type to check match of type against schema
type UnitTypeFromSchema = z.infer<typeof unitTypeSchema>;

/**
 * A unit of troops.
 */
export interface UnitType {
  /** The unique identifier of the unit. */
  id: string;
  /** The capitalized name of the unit. */
  name: string;
  /** The traits of the unit. */
  traits: string[];
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
  /** The attack value required to defeat the unit. */
  defeat: number;
  /** The cost of the unit. */
  cost: number;
  /** The limit of units that can be included in a standard army. */
  limit: number;
}

const _assertExactUnitType: AssertExact<UnitType, UnitTypeFromSchema> = true;
