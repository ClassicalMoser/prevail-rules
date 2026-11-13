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
 *
 * `getLegalCommitToRangedAttackEvents` enumerates the legal options, and
 * `applyCommitToRangedAttackEvent` applies the choice.
 */
export interface CommitToRangedAttackEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE;
  /** The shooting player, committing or declining. */
  player: PlayerSide;
  /**
   * The card from hand to commit, or `null` to decline. Declining is always
   * allowed and spends no card (§8.3).
   */
  committedCard: CommandCard | null;
}

const _commitToRangedAttackEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(COMMIT_TO_RANGED_ATTACK_CHOICE_TYPE),
    /** The shooting player, committing or declining. */
    player: playerSideSchema,
    /**
     * The card from hand to commit, or `null` to decline. Declining is always
     * allowed and spends no card (§8.3).
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
