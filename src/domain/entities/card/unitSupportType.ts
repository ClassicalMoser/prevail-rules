import { z } from 'zod';

/**
 * The kinds of unit a card's support can hold (§10.4.2): any unit at all,
 * units with a trait, or one named unit type.
 */
export const unitSupportTypes = ['generic', 'trait', 'unitType'] as const;

/** What kind of unit a card's support holds. */
export type UnitSupportType = (typeof unitSupportTypes)[number];

/** Support that holds any unit at all. */
export const GENERIC_UNIT_SUPPORT_TYPE: 'generic' = unitSupportTypes[0];

/** Support that holds units with one trait. */
export const TRAIT_UNIT_SUPPORT_TYPE: 'trait' = unitSupportTypes[1];

/** Support that holds units of one named type. */
export const UNIT_TYPE_UNIT_SUPPORT_TYPE: 'unitType' = unitSupportTypes[2];

/** The schema for what kind of unit a card's support holds. */
export const unitSupportTypeSchema: z.ZodType<UnitSupportType> =
  z.enum(unitSupportTypes);
