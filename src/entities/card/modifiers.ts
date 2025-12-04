import type { AssertExact } from '@utils';
import { z } from 'zod';

export const valueTypes = [
  'attack',
  'defense',
  'range',
  'speed',
  'flexibility',
] as const;

/**
 * The types of values that can be used on a card.
 */
export type ValueType = (typeof valueTypes)[number];

const _valueTypesSchemaObject = z.enum(valueTypes);
type ValueTypesSchemaType = z.infer<typeof _valueTypesSchemaObject>;

/**
 * The schema for value types.
 */
export const valueTypesSchema: z.ZodType<ValueType> = _valueTypesSchemaObject;

// Verify manual type matches schema inference
const _assertExactValueType: AssertExact<ValueType, ValueTypesSchemaType> =
  true;

/**
 * A modifier on a card.
 */
export interface Modifier {
  /** The type of the modifier. */
  type: ValueType;
  /** The value of the modifier. */
  value: number;
}

const _modifierSchemaObject = z.object({
  /** The type of the modifier. */
  type: valueTypesSchema,
  /** The value of the modifier. */
  value: z.number().int().min(-2).max(2),
});

type ModifierSchemaType = z.infer<typeof _modifierSchemaObject>;

/**
 * The schema for a modifier on a card.
 */
export const modifierSchema: z.ZodType<Modifier> = _modifierSchemaObject;

// Verify manual type matches schema inference
const _assertExactModifier: AssertExact<Modifier, ModifierSchemaType> = true;
