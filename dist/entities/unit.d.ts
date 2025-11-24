import { AssertExact } from "src/assertExact.js";
import { z } from "zod";
/**
 * The type of the unit.
 */
export declare enum UnitCategory {
  SOLDIER = "soldier",
  HERO = "hero",
  BUILDING = "building",
  RESOURCE = "resource",
}
/**
 * The schema for the unit.
 */
export declare const unitSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    image: z.ZodString;
    category: z.ZodNativeEnum<typeof UnitCategory>;
    faction: z.ZodString;
    cost: z.ZodNumber;
    power: z.ZodNumber;
    rarity: z.ZodNumber;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    name: string;
    description: string;
    image: string;
    category: UnitCategory;
    faction: string;
    cost: number;
    power: number;
    rarity: number;
  },
  {
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
>;
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
export declare const assertExactUnit: AssertExact<Unit, UnitFromSchema>;
export {};
//# sourceMappingURL=unit.d.ts.map
