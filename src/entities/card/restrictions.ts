import type { AssertExact } from "src/utils/assertExact.js";
import type { Trait } from "../../sampleValues/traits.js";
import { z } from "zod";
import { traitSchema } from "../../sampleValues/traits.js";

/**
 * The schema for the restrictions on a card command or round effect.
 */
export const restrictionsSchema = z.object({
  /** The maximum range from the commander allowed for the command or round effect to be applied. */
  inspirationRangeRestriction: z.number().int().min(0).max(10).optional(),
  /** The traits that must be present on the unit for the command or round effect to be applied. */
  traitRestrictions: z.array(traitSchema),
  /** The unique identifiers of the unit types that can be included in the command or round effect. */
  unitRestrictions: z.array(z.string().uuid()),
});

// Helper type to check match of type against schema
type RestrictionsSchemaType = z.infer<typeof restrictionsSchema>;

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
