import type { Board, Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the choose card event. */
export const CHOOSE_CARD_CHOICE_TYPE = 'chooseCard' as const;

/** An eventto choose a card from the player's hand. */
export interface ChooseCardEvent<_TBoard extends Board> {
  /** The type of the event. */
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
  ChooseCardEvent<Board>,
  ChooseCardEventSchemaType
> = true;

/** The schema for a choose card event. */
export const chooseCardEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'playerChoice'>;
  choiceType: z.ZodLiteral<'chooseCard'>;
  player: z.ZodType<PlayerSide>;
  card: z.ZodType<Card>;
}> = _chooseCardEventSchemaObject;
