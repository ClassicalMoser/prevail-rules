import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { CHOOSE_CARD_CHOICE_TYPE } from './playerChoice';

/** An eventto choose a card from the player's hand. */
export interface ChooseCardEvent {
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The type of player choice. */
  choiceType: typeof CHOOSE_CARD_CHOICE_TYPE;
  /** The player who is choosing the card. */
  player: PlayerSide;
  /** The card to choose from the player's hand. */
  card: Card;
}

const _chooseCardEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The type of player choice. */
  choiceType: z.literal(CHOOSE_CARD_CHOICE_TYPE),
  /** The player who is choosing the card. */
  player: playerSideSchema,
  /** The card to choose from the player's hand. */
  card: cardSchema,
});

type ChooseCardEventSchemaType = z.infer<typeof _chooseCardEventSchemaObject>;

// Verify manual type matches schema inference
const _assertExactChooseCardEvent: AssertExact<
  ChooseCardEvent,
  ChooseCardEventSchemaType
> = true;

/** The schema for a choose card event. */
export const chooseCardEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof PLAYER_CHOICE_EVENT_TYPE>;
  choiceType: z.ZodLiteral<typeof CHOOSE_CARD_CHOICE_TYPE>;
  player: typeof playerSideSchema;
  card: typeof cardSchema;
}> = _chooseCardEventSchemaObject;
