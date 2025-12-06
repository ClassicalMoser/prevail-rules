import type { AssertExact } from '@utils';
import type { UnitFacing, UnitInstance } from '../unit';
import { z } from 'zod';
import { unitFacingSchema, unitInstanceSchema } from '../unit';
import { SINGLE_UNIT_PRESENCE_TYPE } from './unitPresenceType';


/**
 * A single unit is present in the space.
 */
export interface SingleUnitPresence {
  /** A single unit is present in the space. */
  presenceType: typeof SINGLE_UNIT_PRESENCE_TYPE;
  /** The unit in the space. */
  unit: UnitInstance;
  /** The facing direction of the unit. */
  facing: UnitFacing;
}

const _singleUnitPresenceSchemaObject = z.object({
  /** A single unit is present in the space. */
  presenceType: z.literal(SINGLE_UNIT_PRESENCE_TYPE),
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
