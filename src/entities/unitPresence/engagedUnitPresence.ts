import type { UnitFacing, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitInstanceSchema } from '@entities';
import { z } from 'zod';

/**
 * Two units are engaged in combat in the space.
 */
export interface EngagedUnitPresence {
  /** Two units are engaged in combat in the space. */
  presenceType: 'engaged';
  /** The primary unit in the engagement. */
  primaryUnit: UnitInstance;
  /** The facing direction of the primary unit. */
  primaryFacing: UnitFacing;
  /** The secondary unit in the engagement (facing opposite the primary unit). */
  secondaryUnit: UnitInstance;
}

const _engagedUnitPresenceSchemaObject = z.object({
  /** Two units are engaged in combat in the space. */
  presenceType: z.literal('engaged' as const),
  /** The primary unit in the engagement. */
  primaryUnit: unitInstanceSchema,
  /** The facing direction of the primary unit. */
  primaryFacing: unitFacingSchema,
  /** The secondary unit in the engagement (facing opposite the primary unit). */
  secondaryUnit: unitInstanceSchema,
});

type EngagedUnitPresenceSchemaType = z.infer<
  typeof _engagedUnitPresenceSchemaObject
>;

/**
 * The schema for two units engaged in combat in a space.
 */
export const engagedUnitPresenceSchema: z.ZodObject<{
  presenceType: z.ZodLiteral<'engaged'>;
  primaryUnit: typeof unitInstanceSchema;
  primaryFacing: typeof unitFacingSchema;
  secondaryUnit: typeof unitInstanceSchema;
}> = _engagedUnitPresenceSchemaObject;

// Verify manual type matches schema inference
const _assertExactEngagedUnitPresence: AssertExact<
  EngagedUnitPresence,
  EngagedUnitPresenceSchemaType
> = true;
