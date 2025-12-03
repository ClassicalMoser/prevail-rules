import type { Command, Modifier, RoundEffect } from "@entities";
import type { AssertExact } from "@utils";
import { z } from "zod";
import { commandSchema } from "./command";
import { modifierSchema } from "./modifiers";
import { roundEffectSchema } from "./roundEffect";

/**
 * The schema for a card.
 *
 * This follows the schema-first type safety pattern used throughout the codebase:
 * 1. Define Zod schema for runtime validation
 * 2. Infer type from schema
 * 3. Define interface manually (for better IDE support and documentation)
 * 4. Assert type match at compile time using AssertExact
 *
 * This ensures type-schema alignment: if the interface doesn't match the schema,
 * TypeScript will error at compile time.
 */
export const cardSchema = z.object({
  /** The unique identifier of the card. */
  id: z.string().uuid(),
  /** The version of the card. */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, {
    message: "Version must be a valid semver string (e.g., 1.0.0, 1.12.35)",
  }),
  /** The name of the card, regardless of version. */
  name: z.string(),
  /** The initiative value of the card. */
  initiative: z.number().int().min(1).max(4),
  /** The modifiers the card can discard for. */
  modifiers: z.array(modifierSchema),
  /** The command of the card. */
  command: commandSchema,
  /** The round effect of the card, if any. */
  roundEffect: roundEffectSchema.optional(),
});

// Helper type to check match of type against schema
type CardSchemaType = z.infer<typeof cardSchema>;

/**
 * A card in the game.
 */
export interface Card {
  /** The unique identifier of the card. */
  id: string;
  /** The version of the card. */
  version: string;
  /** The name of the card, regardless of version. */
  name: string;
  /** The initiative value of the card. */
  initiative: number;
  /** The modifiers the card can discard for. */
  modifiers: Modifier[];
  /** The command to be used on the card. */
  command: Command;
  /** The round effect of the card, if any. */
  roundEffect?: RoundEffect;
}

// Verify manual type matches schema inference
const _assertExactCard: AssertExact<Card, CardSchemaType> = true;
