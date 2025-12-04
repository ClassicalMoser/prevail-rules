import type { UnitFacing, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';

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

const _singleUnitPresenceSchemaObject = z.object({
  /** A single unit is present in the space. */
  presenceType: z.literal('single' as const),
  /** The unit in the space. */
  unit: unitInstanceSchema,
  /** The facing direction of the unit. */
  facing: unitFacingSchema,
});

type SingleUnitPresenceSchemaType = z.infer<
  typeof _singleUnitPresenceSchemaObject
>;

/**
 * The schema for a single unit presence in a space.
 */
export const singleUnitPresenceSchema: z.ZodObject<{
  presenceType: z.ZodLiteral<'single'>;
  unit: typeof unitInstanceSchema;
  facing: typeof unitFacingSchema;
}> = _singleUnitPresenceSchemaObject;

// Verify manual type matches schema inference
const _assertExactSingleUnitPresence: AssertExact<
  SingleUnitPresence,
  SingleUnitPresenceSchemaType
> = true;
