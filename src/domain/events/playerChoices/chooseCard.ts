import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose card event. */
export const CHOOSE_CARD_CHOICE_TYPE = 'chooseCard' as const;

/**
 * In Phase 1 each player chooses the card they will play this round, from
 * their hand. Both choose at once and in secret, face down (§4.1.1).
 *
 * `getLegalChooseCardOptions` enumerates the legal options, and
 * `applyChooseCardEvent` applies the choice.
 */
export interface ChooseCardEvent {
  /** A player choice, not a game effect. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** Which choice this is. Player choices are told apart by it. */
  choiceType: typeof CHOOSE_CARD_CHOICE_TYPE;
  /** The player choosing. */
  player: PlayerSide;
  /** The card chosen, from the player's hand. */
  card: CommandCard;
}

const _chooseCardEventSchemaObject = z
  .object({
    /** A player choice, not a game effect. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** Which choice this is. Player choices are told apart by it. */
    choiceType: z.literal(CHOOSE_CARD_CHOICE_TYPE),
    /** The player choosing. */
    player: playerSideSchema,
    /** The card chosen, from the player's hand. */
    card: commandCardSchema,
  })
  .strict();

type ChooseCardEventSchemaType = z.infer<typeof _chooseCardEventSchemaObject>;

// Verify manual type matches schema inference
const _assertExactChooseCardEvent: AssertExact<
  ChooseCardEvent,
  ChooseCardEventSchemaType
> = true;

/** The schema for a choose card event. */
export const chooseCardEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseCard'>;
  player: z.ZodType<PlayerSide>;
  card: z.ZodType<CommandCard>;
}> = _chooseCardEventSchemaObject;
