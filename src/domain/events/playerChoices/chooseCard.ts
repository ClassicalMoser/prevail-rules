import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import { z } from 'zod';

/** An eventto choose a card from the player's hand. */
export interface ChooseCardEvent {
  eventType: typeof PLAYER_CHOICE_EVENT_TYPE;
  /** The player who is choosing the card. */
  player: PlayerSide;
  /** The card to choose from the player's hand. */
  card: Card;
}

const _chooseCardEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(PLAYER_CHOICE_EVENT_TYPE),
  /** The player who is choosing the card. */
  player: playerSideSchema,
  /** The card to choose from the player's hand. */
  card: cardSchema,
});

type ChooseCardEventSchemaType = z.infer<typeof _chooseCardEventSchemaObject>;

/** The schema for a choose card event. */
export const chooseCardEventSchema: z.ZodType<ChooseCardEvent> =
  _chooseCardEventSchemaObject;

// Verify manual type matches schema inference
const _assertExactChooseCardEvent: AssertExact<
  ChooseCardEvent,
  ChooseCardEventSchemaType
> = true;
