import type { AssertExact } from '@utils';
import { z } from 'zod';

/** All stat modifiers that can be used on a card.
 * This includes all unit stats except the defense stats (reverse, retreat, rout),
 * which are replaced with a single 'defense' type.
 */
export const statModifiers = [
  'attack',
  'range',
  'speed',
  'flexibility',
  'defense',
] as const;

export type StatModifier = (typeof statModifiers)[number];

const _statModifierSchemaObject = z.enum(statModifiers);
type StatModifierSchemaType = z.infer<typeof _statModifierSchemaObject>;

/**
 * The schema for a stat modifier.
 */
export const statModifierSchema: z.ZodType<StatModifier> =
  _statModifierSchemaObject;

// Verify manual type matches schema inference
const _assertExactStatModifier: AssertExact<
  StatModifier,
  StatModifierSchemaType
> = true;

/**
 * A modifier on a card.
 */
export interface Modifier {
  /** The type of the modifier. */
  type: StatModifier;
  /** The value of the modifier. */
  value: number;
}

const _modifierSchemaObject = z.object({
  /** The type of the modifier. */
  type: statModifierSchema,
  /** The value of the modifier. */
  value: z.int().min(-2).max(2),
});

type ModifierSchemaType = z.infer<typeof _modifierSchemaObject>;

/**
 * The schema for a modifier on a card.
 */
export const modifierSchema: z.ZodType<Modifier> = _modifierSchemaObject;

// Verify manual type matches schema inference
const _assertExactModifier: AssertExact<Modifier, ModifierSchemaType> = true;
