import { AssertExact } from "src/assertExact.js";
import { z } from "zod";

/**
 * The type of the unit.
 */
export enum UnitCategory {
  SOLDIER = "soldier",
  HERO = "hero",
  BUILDING = "building",
  RESOURCE = "resource",
}

/**
 * The schema for the unit.
 */
export const unitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  category: z.nativeEnum(UnitCategory),
  faction: z.string(),
  cost: z.number(),
  power: z.number(),
  rarity: z.number(),
});

type UnitFromSchema = z.infer<typeof unitSchema>;

/**
 * The type of the unit.
 */
export interface Unit {
  id: string;
  name: string;
  description: string;
  image: string;
  category: UnitCategory;
  faction: string;
  cost: number;
  power: number;
  rarity: number;
}

export const assertExactUnit: AssertExact<Unit, UnitFromSchema> = true;
