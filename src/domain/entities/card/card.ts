import type { AssertExact } from '@utils';
import type { Command } from './command';
import type { StatModifier } from './modifiers';
import type { RoundEffect } from './roundEffect';

import { z } from 'zod';
import { commandSchema } from './command';
import { statModifierSchema } from './modifiers';
import { roundEffectSchema } from './roundEffect';
import type { UnitSupport } from './unitSupport';
import { unitSupportSchema } from './unitSupport';

/** A hidden card, which is not visible to the player. */
export type HiddenCard = 'hidden';

/** The schema shape for a hidden card. */
const _hiddenCardSchemaObject = z.literal('hidden');

/** The type for a hidden card. */
type HiddenCardSchemaType = z.infer<typeof _hiddenCardSchemaObject>;

/** Assert that the hidden card type matches the schema. */
const _assertExactHiddenCard: AssertExact<HiddenCard, HiddenCardSchemaType> =
  true;

/** The schema for a hidden card. */
export const hiddenCardSchema: z.ZodType<HiddenCard> = _hiddenCardSchemaObject;

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
  modifiers: StatModifier[];
  /** The command to be used on the card. */
  command: Command;
  /** The round effect of the card, if any. */
  roundEffect: RoundEffect;
  /** The unit support this card provides */
  unitSupport: UnitSupport;
}

const _cardSchemaObject = z.object({
  /** The unique identifier of the card. */
  id: z.uuid(),
  /** The version of the card. */
  version: z.string().regex(/^\d+\.\d+\.\d+$/u, {
    message: 'Version must be a valid semver string (e.g., 1.0.0, 1.12.35)',
  }),
  /** The name of the card, regardless of version. */
  name: z.string().min(3),
  /** The initiative value of the card. */
  initiative: z.int().min(1).max(4),
  /** The modifiers the card can discard for. */
  modifiers: z.array(statModifierSchema).min(1).max(2),
  /** The command of the card. */
  command: commandSchema,
  /** The round effect of the card, if any. */
  roundEffect: roundEffectSchema,
  /** The unit support this card provides */
  unitSupport: unitSupportSchema,
});

type CardSchemaType = z.infer<typeof _cardSchemaObject>;

/**
 * The schema for a card.
 *
 * This follows the schema-first type safety pattern used throughout the codebase:
 * 1. Define interface manually (for better IDE support and documentation)
 * 2. Define Zod schema for runtime validation
 * 3. Infer type from schema
 * 4. Assert type match at compile time using AssertExact
 *
 * This ensures type-schema alignment: if the interface doesn't match the schema,
 * TypeScript will error at compile time.
 *
 * Note: We infer from the unconstrained schema object to ensure type inference
 * works correctly with isolatedDeclarations enabled. The constraint is applied on export.
 */
export const cardSchema: z.ZodType<Card> = _cardSchemaObject;

// Verify manual type matches schema inference
const _assertExactCard: AssertExact<Card, CardSchemaType> = true;
