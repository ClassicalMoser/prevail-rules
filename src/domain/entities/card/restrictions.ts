import type { Trait } from '@ruleValues';
import type { AssertExact } from '@utils';
import { traitSchema } from '@ruleValues';
import { z } from 'zod';

/**
 * Restrictions with no trait or unit-type filter.
 * Inspiration range may still apply.
 */
export interface NoTypeRestrictions {
  /** No trait or unit-type filter applies. */
  restrictionType: 'none';
  /** The maximum range from the commander allowed for the command or round effect to be applied. */
  inspirationRangeRestriction: number;
}

const _noTypeRestrictionsSchemaObject = z
  .object({
    /** No trait or unit-type filter applies. */
    restrictionType: z.literal('none'),
    /** The maximum range from the commander allowed for the command or round effect to be applied. */
    inspirationRangeRestriction: z.int().min(-1).max(10),
  })
  .strict();

type NoTypeRestrictionsSchemaType = z.infer<
  typeof _noTypeRestrictionsSchemaObject
>;

/**
 * The schema for restrictions with no trait or unit-type filter.
 */
export const noTypeRestrictionsSchema: z.ZodObject<{
  restrictionType: z.ZodLiteral<'none'>;
  inspirationRangeRestriction: z.ZodInt;
}> = _noTypeRestrictionsSchemaObject;

const _assertExactNoTypeRestrictions: AssertExact<
  NoTypeRestrictions,
  NoTypeRestrictionsSchemaType
> = true;

/**
 * Restrictions that require every listed trait on the unit.
 */
export interface TraitRestrictions {
  /** The unit must have every listed trait. */
  restrictionType: 'trait';
  /** The maximum range from the commander allowed for the command or round effect to be applied. */
  inspirationRangeRestriction: number;
  /** The traits that must be present on the unit for the command or round effect to be applied. */
  traitRestrictions: Trait[];
}

const _traitRestrictionsSchemaObject = z
  .object({
    /** The unit must have every listed trait. */
    restrictionType: z.literal('trait'),
    /** The maximum range from the commander allowed for the command or round effect to be applied. */
    inspirationRangeRestriction: z.int().min(-1).max(10),
    /** The traits that must be present on the unit for the command or round effect to be applied. */
    traitRestrictions: z.array(traitSchema).min(1),
  })
  .strict();

type TraitRestrictionsSchemaType = z.infer<
  typeof _traitRestrictionsSchemaObject
>;

/**
 * The schema for trait restrictions on a card command or round effect.
 */
export const traitRestrictionsSchema: z.ZodObject<{
  restrictionType: z.ZodLiteral<'trait'>;
  inspirationRangeRestriction: z.ZodInt;
  traitRestrictions: z.ZodArray<typeof traitSchema>;
}> = _traitRestrictionsSchemaObject;

const _assertExactTraitRestrictions: AssertExact<
  TraitRestrictions,
  TraitRestrictionsSchemaType
> = true;

/**
 * Restrictions that require the unit to be one of the listed unit types.
 */
export interface UnitTypeRestrictions {
  /** The unit must be one of the listed unit types. */
  restrictionType: 'unitType';
  /** The maximum range from the commander allowed for the command or round effect to be applied. */
  inspirationRangeRestriction: number;
  /** The unique identifiers of the unit types that can be included in the command or round effect. */
  unitRestrictions: string[];
}

const _unitTypeRestrictionsSchemaObject = z
  .object({
    /** The unit must be one of the listed unit types. */
    restrictionType: z.literal('unitType'),
    /** The maximum range from the commander allowed for the command or round effect to be applied. */
    inspirationRangeRestriction: z.int().min(-1).max(10),
    /** The unique identifiers of the unit types that can be included in the command or round effect. */
    unitRestrictions: z.array(z.uuid()).min(1),
  })
  .strict();

type UnitTypeRestrictionsSchemaType = z.infer<
  typeof _unitTypeRestrictionsSchemaObject
>;

/**
 * The schema for unit-type restrictions on a card command or round effect.
 */
export const unitTypeRestrictionsSchema: z.ZodObject<{
  restrictionType: z.ZodLiteral<'unitType'>;
  inspirationRangeRestriction: z.ZodInt;
  unitRestrictions: z.ZodArray<z.ZodUUID>;
}> = _unitTypeRestrictionsSchemaObject;

const _assertExactUnitTypeRestrictions: AssertExact<
  UnitTypeRestrictions,
  UnitTypeRestrictionsSchemaType
> = true;

/**
 * The restrictions of a card command or round effect.
 *
 * A restriction is inspiration range plus at most one filter: traits, or unit
 * types. The two filters are never combined.
 */
export type Restrictions =
  | NoTypeRestrictions
  | TraitRestrictions
  | UnitTypeRestrictions;

const _restrictionsSchemaObject = z.discriminatedUnion('restrictionType', [
  noTypeRestrictionsSchema,
  traitRestrictionsSchema,
  unitTypeRestrictionsSchema,
]);

type RestrictionsSchemaType = z.infer<typeof _restrictionsSchemaObject>;

/**
 * The schema for the restrictions on a card command or round effect.
 */
export const restrictionsSchema: z.ZodType<Restrictions> =
  _restrictionsSchemaObject;

const _assertExactRestrictions: AssertExact<
  Restrictions,
  RestrictionsSchemaType
> = true;
