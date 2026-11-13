import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the commit to movement event. */
export const COMMIT_TO_MOVEMENT_CHOICE_TYPE = 'commitToMovement' as const;

/**
 * A commitment for +1 Speed or +1 Flexibility, made at one of two moments
 * (§8.4). The moving player may commit after naming the unit and before it
 * moves (§4.3.10). The defender in a front engagement may commit before
 * Speeds are compared to see whether it may fall back (§6.3.2).
 *
 * `getLegalCommitToMovementEvents` enumerates the legal options, and
 * `applyCommitToMovementEvent` applies the choice.
 */
export interface CommitToMovementEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof COMMIT_TO_MOVEMENT_CHOICE_TYPE;
  /** The player committing or declining. */
  player: PlayerSide;
  /**
   * The card from hand to commit, or `null` to decline. Declining is always
   * allowed and spends no card (§8.3).
   */
  committedCard: CommandCard | null;
}

const _commitToMovementEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(COMMIT_TO_MOVEMENT_CHOICE_TYPE),
    /** The player committing or declining. */
    player: playerSideSchema,
    /**
     * The card from hand to commit, or `null` to decline. Declining is always
     * allowed and spends no card (§8.3).
     */
    committedCard: commandCardSchema.nullable(),
  })
  .strict();

type CommitToMovementEventSchemaType = z.infer<
  typeof _commitToMovementEventSchemaObject
>;

const _assertExactCommitToMovementEvent: AssertExact<
  CommitToMovementEvent,
  CommitToMovementEventSchemaType
> = true;

/** The schema for a commit to movement event. */
export const commitToMovementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'commitToMovement'>;
  player: typeof playerSideSchema;
  committedCard: z.ZodNullable<typeof commandCardSchema>;
}> = _commitToMovementEventSchemaObject;
