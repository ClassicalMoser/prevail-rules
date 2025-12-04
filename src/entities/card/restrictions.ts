import type { Trait } from '@sampleValues';
import type { AssertExact } from '@utils';
import { traitSchema } from '@sampleValues';
import { z } from 'zod';

/**
 * The schema for the restrictions on a card command or round effect.
 */
const _restrictionsSchemaObject = z.object({
  /** The maximum range from the commander allowed for the command or round effect to be applied. */
  inspirationRangeRestriction: z.number().int().min(0).max(10).optional(),
  /** The traits that must be present on the unit for the command or round effect to be applied. */
  traitRestrictions: z.array(traitSchema),
  /** The unique identifiers of the unit types that can be included in the command or round effect. */
  unitRestrictions: z.array(z.string().uuid()),
});

type RestrictionsSchemaType = z.infer<typeof _restrictionsSchemaObject>;
export const restrictionsSchema: z.ZodType<Restrictions> =
  _restrictionsSchemaObject;

/**
 * The restrictions of a card command or round effect.
 */
export interface Restrictions {
  /** The maximum range from the commander allowed for the command or round effect to be applied. */
  inspirationRangeRestriction?: number;
  /** The traits that must be present on the unit for the command or round effect to be applied. */
  traitRestrictions: Trait[];
  /** The unique identifiers of the unit types that can be included in the command or round effect. */
  unitRestrictions: string[];
}

const _assertExactRestrictions: AssertExact<
  Restrictions,
  RestrictionsSchemaType
> = true;
