import { z } from "zod";
/**
 * The type of the unit.
 */
export var UnitCategory;
(function (UnitCategory) {
  UnitCategory["SOLDIER"] = "soldier";
  UnitCategory["HERO"] = "hero";
  UnitCategory["BUILDING"] = "building";
  UnitCategory["RESOURCE"] = "resource";
})(UnitCategory || (UnitCategory = {}));
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
export const assertExactUnit = true;
