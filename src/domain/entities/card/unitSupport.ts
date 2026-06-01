import type { AssertExact } from '@utils';
import type { Trait } from '@ruleValues';
import { traitSchema } from '@ruleValues';
import { z } from 'zod';

/**
 * Unit support for any units up to a count.
 */
export interface GenericUnitSupport {
  /** Support applies to any units. */
  supportType: 'generic';
  /** The number of units that this card supports. */
  count: number;
}

const _genericUnitSupportSchemaObject = z.object({
  /** Support applies to any units. */
  supportType: z.literal('generic'),
  /** The number of units that this card supports. */
  count: z.number(),
});

type GenericUnitSupportSchemaType = z.infer<
  typeof _genericUnitSupportSchemaObject
>;

/**
 * The schema for generic unit support on a card.
 */
export const genericUnitSupportSchema: z.ZodObject<{
  supportType: z.ZodLiteral<'generic'>;
  count: z.ZodNumber;
}> = _genericUnitSupportSchemaObject;

const _assertExactGenericUnitSupport: AssertExact<
  GenericUnitSupport,
  GenericUnitSupportSchemaType
> = true;

/**
 * Unit support for units with a specific trait up to a count.
 */
export interface TraitUnitSupport {
  /** Support applies to units with a specific trait. */
  supportType: 'trait';
  /** The trait that this card supports. */
  trait: Trait;
  /** The number of units that this card supports. */
  count: number;
}

const _traitUnitSupportSchemaObject = z.object({
  /** Support applies to units with a specific trait. */
  supportType: z.literal('trait'),
  /** The trait that this card supports. */
  trait: traitSchema,
  /** The number of units that this card supports. */
  count: z.number(),
});

type TraitUnitSupportSchemaType = z.infer<typeof _traitUnitSupportSchemaObject>;

/**
 * The schema for trait-based unit support on a card.
 */
export const traitUnitSupportSchema: z.ZodObject<{
  supportType: z.ZodLiteral<'trait'>;
  trait: typeof traitSchema;
  count: z.ZodNumber;
}> = _traitUnitSupportSchemaObject;

const _assertExactTraitUnitSupport: AssertExact<
  TraitUnitSupport,
  TraitUnitSupportSchemaType
> = true;

/**
 * Unit support for units of a specific type up to a count.
 */
export interface UnitTypeUnitSupport {
  /** Support applies to a specific unit type. */
  supportType: 'unitType';
  /** The unit type ID that this card supports. */
  unitTypeId: string;
  /** The number of units that this card supports. */
  count: number;
}

const _unitTypeUnitSupportSchemaObject = z.object({
  /** Support applies to a specific unit type. */
  supportType: z.literal('unitType'),
  /** The unit type ID that this card supports. */
  unitTypeId: z.uuid(),
  /** The number of units that this card supports. */
  count: z.number(),
});

type UnitTypeUnitSupportSchemaType = z.infer<
  typeof _unitTypeUnitSupportSchemaObject
>;

/**
 * The schema for unit-type-based unit support on a card.
 */
export const unitTypeUnitSupportSchema: z.ZodObject<{
  supportType: z.ZodLiteral<'unitType'>;
  unitTypeId: z.ZodUUID;
  count: z.ZodNumber;
}> = _unitTypeUnitSupportSchemaObject;

const _assertExactUnitTypeUnitSupport: AssertExact<
  UnitTypeUnitSupport,
  UnitTypeUnitSupportSchemaType
> = true;

/**
 * Unit support on a card.
 */
export type UnitSupport =
  | GenericUnitSupport
  | TraitUnitSupport
  | UnitTypeUnitSupport;

const _unitSupportSchemaObject = z.discriminatedUnion('supportType', [
  genericUnitSupportSchema,
  traitUnitSupportSchema,
  unitTypeUnitSupportSchema,
]);

type UnitSupportSchemaType = z.infer<typeof _unitSupportSchemaObject>;

/**
 * The schema for unit support on a card.
 */
export const unitSupportSchema: z.ZodType<UnitSupport> =
  _unitSupportSchemaObject;

const _assertExactUnitSupport: AssertExact<UnitSupport, UnitSupportSchemaType> =
  true;
