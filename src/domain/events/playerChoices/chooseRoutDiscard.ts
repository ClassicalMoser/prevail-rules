import type { CommandCard, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { commandCardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the choose rout discard event. */
export const CHOOSE_ROUT_DISCARD_CHOICE_TYPE = 'chooseRoutDiscard' as const;

/**
 * An event to choose which cards to discard as a penalty for routed units.
 * The player must select a number of cards equal to the total rout penalty.
 */
export interface ChooseRoutDiscardEvent {
  /** The type of the event. */
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_ROUT_DISCARD_CHOICE_TYPE;
  /** The player who is discarding cards. */
  player: PlayerSide;
  /**
   * The cards being discarded, from hand. A discard is face up, so the event
   * shows the cards themselves: a seat that cannot see this player's hand
   * still sees what was spent.
   */
  cards: CommandCard[];
}

const _chooseRoutDiscardEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
    /** The type of player choice. */
    choiceType: z.literal(CHOOSE_ROUT_DISCARD_CHOICE_TYPE),
    /** The player who is discarding cards. */
    player: playerSideSchema,
    /** The cards being discarded, from hand. */
    cards: z.array(commandCardSchema),
  })
  .strict();

type ChooseRoutDiscardEventSchemaType = z.infer<
  typeof _chooseRoutDiscardEventSchemaObject
>;

/** The schema for a choose rout discard event. */
export const chooseRoutDiscardEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseRoutDiscard'>;
  player: typeof playerSideSchema;
  cards: z.ZodArray<typeof commandCardSchema>;
}> = _chooseRoutDiscardEventSchemaObject;

// Verify manual type matches schema inference
const _assertExactChooseRoutDiscardEvent: AssertExact<
  ChooseRoutDiscardEvent,
  ChooseRoutDiscardEventSchemaType
> = true;
