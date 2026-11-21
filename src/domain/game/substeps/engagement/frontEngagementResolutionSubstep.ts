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
  /**
   * The engaging unit's Speed, as the comparison reads it (§6.3.2): its full
   * Speed sampled where its move began, its own committed card included
   * (§5.1.4, §4.3.10). Recorded when the engagement starts, because the
   * engaging unit enters the defender's space then, and a Speed read there
   * would measure its reach from the wrong space.
   */
  // TODO (once terrain lands): This does not reflect terrain deficits or speed limits.
  // A solution that does will be needed in the future to prevent absurd outcomes.
  engagingSpeed: number;
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
   * The defender's retreat: `'pending'` until it has fallen back or stood,
   * `'bypassed'` when it stands (it had nowhere to go, or chose to hold), or
   * the open {@link RetreatState}, written with the retreats the engagement
   * recorded, as an attack apply's is.
   */
  retreatState: RetreatState | 'pending' | 'bypassed';
}

const _frontEngagementResolutionStateSchemaObject = z
  .object({
    /** The type of engagement. */
    engagementType: z.literal('front'),
    /** The engaging unit's Speed, sampled where its move began. */
    engagingSpeed: z.int().min(0),
    /** The commitment of the defending player. */
    defensiveCommitment: commitmentSchema,
    /** The retreats the defender may make, each as its path. */
    retreatPaths: z.array(z.array(moveDeltaSchema)).or(z.literal('pending')),
    /** Whether the defending unit chooses to retreat. */
    defendingUnitRetreats: z.boolean().or(z.literal('pending')),
    /** The defender's retreat, once it falls back. */
    retreatState: retreatStateSchema
      .or(z.literal('pending'))
      .or(z.literal('bypassed')),
  })
  .strict();

type FrontEngagementResolutionStateSchemaType = z.infer<
  typeof _frontEngagementResolutionStateSchemaObject
>;

/** The schema for the front engagement resolution state. */
export const frontEngagementResolutionStateSchema: z.ZodObject<{
  engagementType: z.ZodLiteral<'front'>;
  engagingSpeed: z.ZodInt;
  defensiveCommitment: z.ZodType<Commitment>;
  retreatPaths: z.ZodType<'pending' | MoveDelta[][]>;
  defendingUnitRetreats: z.ZodType<'pending' | boolean>;
  retreatState: z.ZodType<RetreatState | 'pending' | 'bypassed'>;
}> = _frontEngagementResolutionStateSchemaObject;

const _assertExactFrontEngagementResolutionState: AssertExact<
  FrontEngagementResolutionState,
  FrontEngagementResolutionStateSchemaType
> = true;
