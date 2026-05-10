import type { AssertExact } from '@utils';
import type { Card } from './card';
import { z } from 'zod';
import { cardSchema } from './card';

/** The state of a player's cards. */
export interface PlayerCardState {
  /** The cards in the player's hand, eligible to be played. */
  inHand: Card[];
  /** The facedown card that the player is currently playing. */
  awaitingPlay: Card | null;
  /** The faceup card that is in play.*/
  inPlay: Card | null;
  /** The cards that have been played and are not currently accessible to the player. */
  played: Card[];
  /** The cards that have been discarded and are not currently accessible to the player. */
  discarded: Card[];
  /** The cards that have been burnt and cannot be recovered. */
  burnt: Card[];
}

const _playerCardStateSchemaObject = z.object({
  /** The cards in the player's hand, eligible to be played. */
  inHand: z.array(cardSchema),
  /** The facedown card that the player is currently playing. */
  awaitingPlay: cardSchema.nullable(),
  /** The faceup card that is in play.*/
  inPlay: cardSchema.nullable(),
  /** The cards that have been played and are not currently accessible to the player. */
  played: z.array(cardSchema),
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
