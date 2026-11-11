import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to melee event. */
export const COMMIT_TO_MELEE_CHOICE_TYPE = 'commitToMelee' as const;

/** An event to commit a card to melee — or refuse (`committedCard` null). */
export interface CommitToMeleeEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof COMMIT_TO_MELEE_CHOICE_TYPE;
  /** The player who is committing (or refusing). */
  player: PlayerSide;
  /**
   * Card from hand to commit, or `null` to refuse / decline the commitment
   * without spending a card.
   */
  committedCard: CommandCard | null;
}

const _commitToMeleeEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(COMMIT_TO_MELEE_CHOICE_TYPE),
    /** The player who is committing (or refusing). */
    player: playerSideSchema,
    /**
     * Card from hand to commit, or `null` to refuse / decline the commitment
     * without spending a card.
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
