import type { MoveDelta } from '@entities';
import type { Commitment } from '@game/commitment';
import type { AssertExact } from '@utils';
import type { RetreatState } from '../combatOutcomes';
import { moveDeltaSchema } from '@entities';
import { commitmentSchema } from '@game/commitment';
import { z } from 'zod';
import { retreatStateSchema } from '../combatOutcomes';

/** The resolution state of an engagement from the front. */
export interface FrontEngagementResolutionState {
  /** The type of engagement. */
  engagementType: 'front';
  /** The commitment of the defending player. */
  defensiveCommitment: Commitment;
  /**
   * The retreats the defender may make, each as its path (§9.1.3), worked out
   * once the defender's commitment is in. Empty means it has nowhere to fall
   * back to, or is not the faster, and stands (§6.3.2).
   */
  retreatPaths: 'pending' | MoveDelta[][];
  /** Whether the defending unit chooses to retreat. */
  defendingUnitRetreats: 'pending' | boolean;
  /**
   * Nested retreat substep once the defender accepts retreat.
   * Baked with {@link RetreatState.legalRetreatPaths} like attack-apply.
   */
  retreatState: RetreatState | 'pending';
}

const _frontEngagementResolutionStateSchemaObject = z
  .object({
    /** The type of engagement. */
    engagementType: z.literal('front'),
    /** The commitment of the defending player. */
    defensiveCommitment: commitmentSchema,
    /** The retreats the defender may make, each as its path. */
    retreatPaths: z.array(z.array(moveDeltaSchema)).or(z.literal('pending')),
    /** Whether the defending unit chooses to retreat. */
    defendingUnitRetreats: z.boolean().or(z.literal('pending')),
    /** Nested retreat substep once the defender accepts retreat. */
    retreatState: retreatStateSchema.or(z.literal('pending')),
  })
  .strict();

type FrontEngagementResolutionStateSchemaType = z.infer<
  typeof _frontEngagementResolutionStateSchemaObject
>;

/** The schema for the front engagement resolution state. */
export const frontEngagementResolutionStateSchema: z.ZodObject<{
  engagementType: z.ZodLiteral<'front'>;
  defensiveCommitment: z.ZodType<Commitment>;
  retreatPaths: z.ZodType<'pending' | MoveDelta[][]>;
  defendingUnitRetreats: z.ZodType<'pending' | boolean>;
  retreatState: z.ZodType<RetreatState | 'pending'>;
}> = _frontEngagementResolutionStateSchemaObject;

const _assertExactFrontEngagementResolutionState: AssertExact<
  FrontEngagementResolutionState,
  FrontEngagementResolutionStateSchemaType
> = true;
