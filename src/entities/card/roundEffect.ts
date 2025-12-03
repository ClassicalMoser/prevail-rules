import type { Modifier, Restrictions } from "@entities";
import type { AssertExact } from "@utils";
import { z } from "zod";
import { modifierSchema } from "./modifiers";
import { restrictionsSchema } from "./restrictions";

export const roundEffectSchema = z.object({
  /** The restrictions on the round effect. */
  restrictions: restrictionsSchema,
  /** The modifiers the round effect applies. */
  modifiers: z.array(modifierSchema),
});

// Helper type to check match of type against schema
type RoundEffectSchemaType = z.infer<typeof roundEffectSchema>;

/**
 * The round effect of a card.
 */
export interface RoundEffect {
  /** The restrictions on the round effect. */
  restrictions: Restrictions;
  /** The modifiers the round effect applies. */
  modifiers: Modifier[];
}

const _assertExactRoundEffect: AssertExact<RoundEffect, RoundEffectSchemaType> =
  true;
