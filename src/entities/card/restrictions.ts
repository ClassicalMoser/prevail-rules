import type { AssertExact } from "src/utils/assertExact.js";
import type { Trait } from "../../sampleValues/traits.js";
import { z } from "zod";
import { traitSchema } from "../../sampleValues/traits.js";

/**
 * The schema for the restrictions on a card command.
 */
export const restrictionsSchema = z.object({
  /** The maximum range from the commander. */
  inspirationRangeRestriction: z.number().int().min(1).max(10).nullable(),
  /** The traits that must be present on the units in the command. */
  traitRestrictions: z.array(traitSchema),
  /** The unique identifiers of the unit types that can be included in the command. */
  unitRestrictions: z.array(z.string().uuid()),
});

// Helper type to check match of type against schema
type RestrictionsSchemaType = z.infer<typeof restrictionsSchema>;

/**
 * The restrictions of a card command on a card.
 */
export interface Restrictions {
  /** The maximum range from the commander. */
  inspirationRangeRestriction: number | null;
  /** The traits that must be present on the units in the command. */
  traitRestrictions: Trait[];
  /** The unique identifiers of the unit types that can be included in the command. */
  unitRestrictions: string[];
}

const _assertExactRestrictions: AssertExact<
  Restrictions,
  RestrictionsSchemaType
> = true;
