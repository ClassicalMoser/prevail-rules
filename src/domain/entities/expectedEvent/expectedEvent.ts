import type { AssertExact } from '@utils';
import type { ExpectedGameEffect } from './expectedGameEffect';
import type { ExpectedPlayerInput } from './expectedPlayerInput';

import { z } from 'zod';
import { expectedGameEffectSchema } from './expectedGameEffect';
import { expectedPlayerInputSchema } from './expectedPlayerInput';

/**
 * Discriminated union of all expected event types.
 * Used by orchestrator to determine what action to take next.
 */
export type ExpectedEventInfo = ExpectedPlayerInput | ExpectedGameEffect;

const _expectedEventInfoSchemaObject = z.discriminatedUnion('actionType', [
  expectedPlayerInputSchema,
  expectedGameEffectSchema,
]);

type ExpectedEventInfoSchemaType = z.infer<
  typeof _expectedEventInfoSchemaObject
>;

const _assertExactExpectedEventInfo: AssertExact<
  ExpectedEventInfo,
  ExpectedEventInfoSchemaType
> = true;

/** The schema for expected event info. */
export const expectedEventInfoSchema: z.ZodType<ExpectedEventInfo> =
  _expectedEventInfoSchemaObject;
