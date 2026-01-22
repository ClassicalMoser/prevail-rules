import type { AssertExact } from '@utils';
import type { FlankEngagementResolutionState } from './flankEngagementResolutionSubstep';
import type { FrontEngagementResolutionState } from './frontEngagementResolutionSubstep';
import type { RearEngagementResolutionState } from './rearEngagementResolutionSubstep';
import { z } from 'zod';
import { flankEngagementResolutionStateSchema } from './flankEngagementResolutionSubstep';
import { frontEngagementResolutionStateSchema } from './frontEngagementResolutionSubstep';
import { rearEngagementResolutionStateSchema } from './rearEngagementResolutionSubstep';

/** The combined resolution state of an engagement. */
export type EngagementResolutionState =
  | FrontEngagementResolutionState
  | FlankEngagementResolutionState
  | RearEngagementResolutionState;

/** The schema shape for the engagement resolution state. */
const _engagementResolutionStateSchemaObject = z.discriminatedUnion(
  'engagementType',
  [
    frontEngagementResolutionStateSchema,
    flankEngagementResolutionStateSchema,
    rearEngagementResolutionStateSchema,
  ],
);

type EngagementResolutionStateSchemaType = z.infer<
  typeof _engagementResolutionStateSchemaObject
>;

const _assertExactEngagementResolutionState: AssertExact<
  EngagementResolutionState,
  EngagementResolutionStateSchemaType
> = true;

/** The schema for the engagement resolution state. */
export const engagementResolutionStateSchema: z.ZodType<EngagementResolutionState> =
  _engagementResolutionStateSchemaObject;
