import type { AssertExact } from "@utils";
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
] as const;

export const traitSchema = z.enum(traits);

type TraitSchemaType = z.infer<typeof traitSchema>;

/**
 * A trait of a unit.
 */
export type Trait = (typeof traits)[number];

/**
 * Check that the trait type matches the schema.
 */
const _assertExactTrait: AssertExact<Trait, TraitSchemaType> = true;
