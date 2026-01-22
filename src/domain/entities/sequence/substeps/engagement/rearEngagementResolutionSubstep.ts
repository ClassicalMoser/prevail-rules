import type { AssertExact } from '@utils';
import type { RoutDiscardState } from '../routDiscardSubstep';
import { z } from 'zod';
import { routDiscardStateSchema } from '../routDiscardSubstep';

/** The resolution state of an engagement from the rear. */
export interface RearEngagementResolutionState {
  /** The type of engagement. */
  engagementType: 'rear';
  /** Whether the defending unit is routed by rear engagement. */
  defenderRouted: boolean;
  /** The state of the rout discard. */
  routDiscardState: RoutDiscardState | undefined;
}

const _rearEngagementResolutionStateSchemaObject = z.object({
  /** The type of engagement. */
  engagementType: z.literal('rear'),
  /** Whether the defending unit is routed. */
  defenderRouted: z.boolean(),
  /** The state of the rout discard. */
  routDiscardState: routDiscardStateSchema.or(z.undefined()),
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
  defenderRouted: z.ZodType<boolean>;
  routDiscardState: z.ZodType<RoutDiscardState | undefined>;
}> = _rearEngagementResolutionStateSchemaObject;
