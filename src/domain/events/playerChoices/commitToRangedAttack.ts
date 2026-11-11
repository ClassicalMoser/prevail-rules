import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to ranged attack event. */
export const COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE =
  'commitToRangedAttack' as const;

/**
 * The shooter's one commitment in a ranged attack (§4.3.11, §7.4.5): after
 * the shooter is named and before its target is, its owner may commit a
 * card, or refuse (`committedCard` null). The card counts for the whole shot:
 * its Range when the target is chosen, its Attack when the shot lands.
 */
export interface CommitToRangedAttackEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE;
  /** The shooting player, committing (or refusing). */
  player: PlayerSide;
  /**
   * Card from hand to commit, or `null` to refuse / decline the commitment
   * without spending a card.
   */
  committedCard: CommandCard | null;
}

const _commitToRangedAttackEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE),
    /** The player who is committing (or refusing). */
    player: playerSideSchema,
    /**
     * Card from hand to commit, or `null` to refuse / decline the commitment
     * without spending a card.
     */
    committedCard: commandCardSchema.nullable(),
  })
  .strict();

type CommitToRangedAttackEventSchemaType = z.infer<
  typeof _commitToRangedAttackEventSchemaObject
>;

const _assertExactCommitToRangedAttackEvent: AssertExact<
  CommitToRangedAttackEvent,
  CommitToRangedAttackEventSchemaType
> = true;

/** The schema for a commit to ranged attack event. */
export const commitToRangedAttackEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToRangedAttack'>;
  player: typeof playerSideSchema;
  committedCard: z.ZodNullable<typeof commandCardSchema>;
}> = _commitToRangedAttackEventSchemaObject;
