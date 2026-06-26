import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';

/** The resolution state of an engagement from the front. */
export interface FrontEngagementResolutionState {
  /** The type of engagement. */
  engagementType: 'front';
  /** The commitment of the defending player. */
  defensiveCommitment: Commitment;
  /** Whether the defending unit can retreat. */
  defendingUnitCanRetreat: 'pending' | boolean;
  /** Whether the defending unit chooses to retreat. */
  defendingUnitRetreats: 'pending' | boolean;
  /** Whether the defending unit has retreated. */
  defendingUnitRetreated: 'pending' | boolean;
}

const _frontEngagementResolutionStateSchemaObject = z.object({
  /** The type of engagement. */
  engagementType: z.literal('front'),
  /** The commitment of the defending player. */
  defensiveCommitment: commitmentSchema,
  /** Whether the defending unit can retreat. */
  defendingUnitCanRetreat: z.boolean().or(z.literal('pending')),
  /** Whether the defending unit chooses to retreat. */
  defendingUnitRetreats: z.boolean().or(z.literal('pending')),
  /** Whether the defending unit has retreated. */
  defendingUnitRetreated: z.boolean().or(z.literal('pending')),
});

type FrontEngagementResolutionStateSchemaType = z.infer<
  typeof _frontEngagementResolutionStateSchemaObject
>;

const _assertExactFrontEngagementResolutionState: AssertExact<
  FrontEngagementResolutionState,
  FrontEngagementResolutionStateSchemaType
> = true;

/** The schema for the front engagement resolution state. */
export const frontEngagementResolutionStateSchema: z.ZodObject<{
  engagementType: z.ZodLiteral<'front'>;
  defensiveCommitment: z.ZodType<Commitment>;
  defendingUnitCanRetreat: z.ZodType<'pending' | boolean>;
  defendingUnitRetreats: z.ZodType<'pending' | boolean>;
  defendingUnitRetreated: z.ZodType<'pending' | boolean>;
}> = _frontEngagementResolutionStateSchemaObject;
