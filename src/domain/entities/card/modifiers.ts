import type { StatModifier } from '@ruleValues';
import type { AssertExact } from '@utils';
import { statModifierSchema } from '@ruleValues';
import { z } from 'zod';

/**
 * A modifier on a card.
 */
export interface Modifier {
  /** The type of the modifier. */
  type: StatModifier;
  /** The value of the modifier. */
  value: number;
}

const _modifierSchemaObject = z
  .object({
    /** The type of the modifier. */
    type: statModifierSchema,
    /** The value of the modifier. */
    value: z.int().min(-2).max(2),
  })
  .strict();

type ModifierSchemaType = z.infer<typeof _modifierSchemaObject>;

/**
 * The schema for a modifier on a card.
 */
export const modifierSchema: z.ZodType<Modifier> = _modifierSchemaObject;

// Verify manual type matches schema inference
const _assertExactModifier: AssertExact<Modifier, ModifierSchemaType> = true;
