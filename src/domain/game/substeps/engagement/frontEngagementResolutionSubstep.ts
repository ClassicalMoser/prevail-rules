import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { RetreatState } from '../retreatSubstep';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { retreatStateSchema } from '../retreatSubstep';

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
  /**
   * Nested retreat substep once the defender accepts retreat.
   * Baked with {@link RetreatState.legalRetreatOptions} like attack-apply.
   */
  retreatState: RetreatState | 'pending';
}

const _frontEngagementResolutionStateSchemaObject = z
  .object({
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
    /** Nested retreat substep once the defender accepts retreat. */
    retreatState: retreatStateSchema.or(z.literal('pending')),
  })
  .strict();

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
  retreatState: z.ZodType<RetreatState | 'pending'>;
}> = _frontEngagementResolutionStateSchemaObject;
