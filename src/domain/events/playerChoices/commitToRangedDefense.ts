import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to ranged defense event. */
export const COMMIT_TO_RANGED_DEFENSE_CHOICE_TYPE =
  'commitToRangedDefense' as const;

/**
 * The target's commitment in a ranged attack (§4.3.11 step 5, §7.4.5): once
 * the shooter has committed and named its target, the target's owner may
 * commit a card for Defence or Flexibility, or refuse (`committedCard` null). A separate
 * event from the shooter's, so a shooter can never commit Defence and a
 * target can never commit Range.
 */
export interface CommitToRangedDefenseEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_RANGED_DEFENSE_CHOICE_TYPE;
  /** The target's owner, committing (or refusing). */
  player: PlayerSide;
  /**
   * Card from hand to commit, or `null` to refuse / decline the commitment
   * without spending a card.
   */
  committedCard: CommandCard | null;
}

const _commitToRangedDefenseEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(COMMIT_TO_RANGED_DEFENSE_CHOICE_TYPE),
    /** The target's owner, committing (or refusing). */
    player: playerSideSchema,
    /**
     * Card from hand to commit, or `null` to refuse / decline the commitment
     * without spending a card.
     */
    committedCard: commandCardSchema.nullable(),
  })
  .strict();

type CommitToRangedDefenseEventSchemaType = z.infer<
  typeof _commitToRangedDefenseEventSchemaObject
>;

const _assertExactCommitToRangedDefenseEvent: AssertExact<
  CommitToRangedDefenseEvent,
  CommitToRangedDefenseEventSchemaType
> = true;

/** The schema for a commit to ranged defense event. */
export const commitToRangedDefenseEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToRangedDefense'>;
  player: typeof playerSideSchema;
  committedCard: z.ZodNullable<typeof commandCardSchema>;
}> = _commitToRangedDefenseEventSchemaObject;
