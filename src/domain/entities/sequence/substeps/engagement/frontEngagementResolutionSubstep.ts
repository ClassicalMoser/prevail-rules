import type { Commitment } from '@entities/sequence';
import type { AssertExact } from '@utils';
import { commitmentSchema } from '@entities/sequence';
import { z } from 'zod';

/** The resolution state of an engagement from the front. */
export interface FrontEngagementResolutionState {
  /** The type of engagement. */
  engagementType: 'front';
  /** The commitment of the defending player. */
  defensiveCommitment: Commitment;
  /** Whether the defending unit can retreat. */
  defendingUnitCanRetreat: boolean | undefined;
  /** Whether the defending unit chooses to retreat. */
  defendingUnitRetreats: boolean | undefined;
  /** Whether the defending unit has retreated. */
  defendingUnitRetreated: boolean | undefined;
}

const _frontEngagementResolutionStateSchemaObject = z.object({
  /** The type of engagement. */
  engagementType: z.literal('front'),
  /** The commitment of the defending player. */
  defensiveCommitment: commitmentSchema,
  /** Whether the defending unit can retreat. */
  defendingUnitCanRetreat: z.boolean().or(z.undefined()),
  /** Whether the defending unit chooses to retreat. */
  defendingUnitRetreats: z.boolean().or(z.undefined()),
  /** Whether the defending unit has retreated. */
  defendingUnitRetreated: z.boolean().or(z.undefined()),
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
  defendingUnitCanRetreat: z.ZodType<boolean | undefined>;
  defendingUnitRetreats: z.ZodType<boolean | undefined>;
  defendingUnitRetreated: z.ZodType<boolean | undefined>;
}> = _frontEngagementResolutionStateSchemaObject;
