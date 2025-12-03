import type { UnitFacing, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';

/**
 * The schema for a single unit presence in a space.
 */
export const singleUnitPresenceSchema: z.ZodObject<{
  presenceType: z.ZodLiteral<'single'>;
  unit: typeof unitInstanceSchema;
  facing: typeof unitFacingSchema;
}> = z.object({
  /** A single unit is present in the space. */
  presenceType: z.literal('single' as const),
  /** The unit in the space. */
  unit: unitInstanceSchema,
  /** The facing direction of the unit. */
  facing: unitFacingSchema,
});

// Helper type to check match of type against schema
type SingleUnitPresenceSchemaType = z.infer<typeof singleUnitPresenceSchema>;

/**
 * A single unit is present in the space.
 */
export interface SingleUnitPresence {
  /** A single unit is present in the space. */
  presenceType: 'single';
  /** The unit in the space. */
  unit: UnitInstance;
  /** The facing direction of the unit. */
  facing: UnitFacing;
}

const _assertExactSingleUnitPresence: AssertExact<
  SingleUnitPresence,
  SingleUnitPresenceSchemaType
> = true;
