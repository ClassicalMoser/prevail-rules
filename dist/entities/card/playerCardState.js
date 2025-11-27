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
const _assertExactPlayerCardState = true;
