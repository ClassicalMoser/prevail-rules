import type { AssertExact } from "../../utils/assertExact.js";
import type { Command } from "./command.js";
import type { Modifier } from "./modifiers.js";
import type { RoundEffect } from "./roundEffect.js";
import { z } from "zod";
import { commandSchema } from "./command.js";
import { modifierSchema } from "./modifiers.js";
import { roundEffectSchema } from "./roundEffect.js";

/**
 * The schema for a card.
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
