import type { AssertExact } from "@utils";
import { z } from "zod";

export const valueTypes = [
  "attack",
  "defense",
  "range",
  "speed",
  "flexibility",
] as const;

export const valueTypesSchema = z.enum(valueTypes);

// Helper type to check match of type against schema
type ValueTypesSchemaType = z.infer<typeof valueTypesSchema>;

/**
 * The types of values that can be used on a card.
 */
export type ValueType = (typeof valueTypes)[number];

const _assertExactValueType: AssertExact<ValueType, ValueTypesSchemaType> =
  true;

/**
 * The schema for a modifier on a card.
 */
export const modifierSchema = z.object({
  /** The type of the modifier. */
  type: valueTypesSchema,
  /** The value of the modifier. */
  value: z.number().int().min(-2).max(2),
});

// Helper type to check match of type against schema
type ModifierSchemaType = z.infer<typeof modifierSchema>;

/**
 * A modifier on a card.
 */
export interface Modifier {
  /** The type of the modifier. */
  type: ValueType;
  /** The value of the modifier. */
  value: number;
}

const _assertExactModifier: AssertExact<Modifier, ModifierSchemaType> = true;
