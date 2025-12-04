import type { Card } from '@entities';
import type { AssertExact } from '@utils';
import { z } from 'zod';
import { cardSchema } from './card';

/** The state of a player's cards. */
export interface PlayerCardState {
  /** The cards in the player's hand, eligible to be played. */
  inHand: Card[];
  /** The facedown card that the player is currently playing. */
  awaitingPlay: Card;
  /** The faceup card that is in play.*/
  inPlay: Card;
  /** The cards that have been discarded and are not currently accessible to the player. */
  discarded: Card[];
  /** The cards that have been burnt and cannot be recovered. */
  burnt: Card[];
}

const _playerCardStateSchemaObject = z.object({
  /** The cards in the player's hand, eligible to be played. */
  inHand: z.array(cardSchema),
  /** The facedown card that the player is currently playing. */
  awaitingPlay: cardSchema,
  /** The faceup card that is in play.*/
  inPlay: cardSchema,
  /** The cards that have been discarded and are not currently accessible to the player. */
  discarded: z.array(cardSchema),
  /** The cards that have been burnt and cannot be recovered. */
  burnt: z.array(cardSchema),
});

type PlayerCardStateSchemaType = z.infer<typeof _playerCardStateSchemaObject>;

/** The schema for a player's card state. */
export const playerCardStateSchema: z.ZodType<PlayerCardState> =
  _playerCardStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactPlayerCardState: AssertExact<
  PlayerCardState,
  PlayerCardStateSchemaType
> = true;
