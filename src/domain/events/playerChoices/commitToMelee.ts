import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to melee event. */
export const COMMIT_TO_MELEE_CHOICE_TYPE = 'commitToMelee' as const;

/**
 * A commitment for one side of a melee (§7.2.2). The first player may commit
 * for their unit, then the second player may do the same. Either may decline
 * (§8.3).
 *
 * `getLegalCommitToMeleeEvents` enumerates the legal options, and
 * `applyCommitToMeleeEvent` applies the choice.
 */
export interface CommitToMeleeEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof COMMIT_TO_MELEE_CHOICE_TYPE;
  /** The player committing or declining. */
  player: PlayerSide;
  /**
   * The card from hand to commit, or `null` to decline. Declining is always
   * allowed and spends no card (§8.3).
   */
  committedCard: CommandCard | null;
}

const _commitToMeleeEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(COMMIT_TO_MELEE_CHOICE_TYPE),
    /** The player committing or declining. */
    player: playerSideSchema,
    /**
     * The card from hand to commit, or `null` to decline. Declining is always
     * allowed and spends no card (§8.3).
     */
    committedCard: commandCardSchema.nullable(),
  })
  .strict();

type CommitToMeleeEventSchemaType = z.infer<
  typeof _commitToMeleeEventSchemaObject
>;

const _assertExactCommitToMeleeEvent: AssertExact<
  CommitToMeleeEvent,
  CommitToMeleeEventSchemaType
> = true;

/** The schema for a commit to melee event. */
export const commitToMeleeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToMelee'>;
  player: typeof playerSideSchema;
  committedCard: z.ZodNullable<typeof commandCardSchema>;
}> = _commitToMeleeEventSchemaObject;
