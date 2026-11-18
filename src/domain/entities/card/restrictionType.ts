import { z } from 'zod';

/**
 * The filters a restriction can apply beside its inspiration range
 * (§4.3.4): none, traits, or unit types. The two filters are never combined.
 */
export const restrictionTypes = ['none', 'trait', 'unitType'] as const;

/** Which filter a restriction applies. */
export type RestrictionType = (typeof restrictionTypes)[number];

/** A restriction with no filter beside its inspiration range. */
export const NO_TYPE_RESTRICTION_TYPE: 'none' = restrictionTypes[0];

/** A restriction to units with every listed trait. */
export const TRAIT_RESTRICTION_TYPE: 'trait' = restrictionTypes[1];

/** A restriction to units of the listed types. */
export const UNIT_TYPE_RESTRICTION_TYPE: 'unitType' = restrictionTypes[2];

/** The schema for which filter a restriction applies. */
export const restrictionTypeSchema: z.ZodType<RestrictionType> =
  z.enum(restrictionTypes);
