import type { AssertExact } from '@utils';
import type { Modifier } from './modifiers';
import type { Restrictions } from './restrictions';

import { z } from 'zod';
import { modifierSchema } from './modifiers';
import { restrictionsSchema } from './restrictions';

/**
 * The round effect of a card.
 */
export interface RoundEffect {
  /** The restrictions on the round effect. */
  restrictions: Restrictions;
  /** The modifiers the round effect applies. */
  modifiers: Modifier[];
}

const _roundEffectSchemaObject = z.object({
  /** The restrictions on the round effect. */
  restrictions: restrictionsSchema,
  /** The modifiers the round effect applies. */
  modifiers: z.array(modifierSchema),
});

type RoundEffectSchemaType = z.infer<typeof _roundEffectSchemaObject>;

/**
 * The schema for a round effect.
 */
export const roundEffectSchema: z.ZodType<RoundEffect> =
  _roundEffectSchemaObject;

// Verify manual type matches schema inference
const _assertExactRoundEffect: AssertExact<RoundEffect, RoundEffectSchemaType> =
  true;
