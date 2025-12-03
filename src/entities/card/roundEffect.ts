import type { Modifier } from "@entities/card/modifiers.js";
import type { Restrictions } from "@entities/card/restrictions.js";
import type { AssertExact } from "@utils/assertExact.js";
import { modifierSchema } from "@entities/card/modifiers.js";
import { restrictionsSchema } from "@entities/card/restrictions.js";
import { z } from "zod";

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
