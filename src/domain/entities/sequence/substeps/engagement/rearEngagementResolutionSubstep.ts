import type { AssertExact } from '@utils';
import type { RoutState } from '../routSubstep';
import { z } from 'zod';
import { routStateSchema } from '../routSubstep';

/** The resolution state of an engagement from the rear. */
export interface RearEngagementResolutionState {
  /** The type of engagement. */
  engagementType: 'rear';
  /** The state of the rout. */
  routState: RoutState;
}

const _rearEngagementResolutionStateSchemaObject = z.object({
  /** The type of engagement. */
  engagementType: z.literal('rear'),
  /** The state of the rout. */
  routState: routStateSchema,
});

type RearEngagementResolutionStateSchemaType = z.infer<
  typeof _rearEngagementResolutionStateSchemaObject
>;

const _assertExactRearEngagementResolutionState: AssertExact<
  RearEngagementResolutionState,
  RearEngagementResolutionStateSchemaType
> = true;

/** The schema for the rear engagement resolution state. */
export const rearEngagementResolutionStateSchema: z.ZodObject<{
  engagementType: z.ZodLiteral<'rear'>;
  routState: z.ZodType<RoutState>;
}> = _rearEngagementResolutionStateSchemaObject;
