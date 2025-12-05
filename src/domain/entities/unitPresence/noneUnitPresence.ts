import type { AssertExact } from '@utils';
import { z } from 'zod';
import { NONE_UNIT_PRESENCE_TYPE } from './unitPresenceType';

/**
 * No unit is present in the space.
 */
export interface NoneUnitPresence {
  /** No unit is present in the space. */
  presenceType: typeof NONE_UNIT_PRESENCE_TYPE;
}

const _noneUnitPresenceSchemaObject = z.object({
  /** No unit is present in the space. */
  presenceType: z.literal(NONE_UNIT_PRESENCE_TYPE),
});

type NoneUnitPresenceSchemaType = z.infer<typeof _noneUnitPresenceSchemaObject>;

/**
 * The schema for no unit presence in a space.
 */
export const noneUnitPresenceSchema: z.ZodObject<{
  presenceType: z.ZodLiteral<'none'>;
}> = _noneUnitPresenceSchemaObject;

// Verify manual type matches schema inference
const _assertExactNoneUnitPresence: AssertExact<
  NoneUnitPresence,
  NoneUnitPresenceSchemaType
> = true;
