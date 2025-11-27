import { cardSchema } from "src/entities/card/card.js";
import { playerSideSchema } from "src/entities/player/playerSide.js";
import { z } from "zod";
/** The schema for a choose card command. */
export const chooseCardCommandSchema = z.object({
    /** The player who is choosing the card. */
    player: playerSideSchema,
    /** The card to choose from the player's hand. */
    card: cardSchema,
});
// Helper type to check match of type against schema.
const _assertExactChooseCardCommand = true;
