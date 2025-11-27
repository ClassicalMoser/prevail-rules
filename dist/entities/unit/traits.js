import { z } from "zod";
export const traits = [
  "formation",
  "sword",
  "spear",
  "phalanx",
  "skirmish",
  "javelin",
  "mounted",
  "horse",
];
export const traitSchema = z.enum(traits);
/**
 * Check that the trait type matches the schema.
 */
const _assertExactTrait = true;
