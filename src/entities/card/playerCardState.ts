import type { AssertExact } from "src/utils/assertExact.js";
import type { Card } from "./card.js";

import { z } from "zod";
import { cardSchema } from "./card.js";

/** The schema for a player's card state. */
export const playerCardStateSchema = z.object({
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

// Helper type to check match of type against schema
type PlayerCardStateSchemaType = z.infer<typeof playerCardStateSchema>;

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

const _assertExactPlayerCardState: AssertExact<
  PlayerCardState,
  PlayerCardStateSchemaType
> = true;
