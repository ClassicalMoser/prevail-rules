import type { Card } from "src/entities/card/card.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import type { AssertExact } from "src/utils/assertExact.js";
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
type ChooseCardCommandSchemaType = z.infer<typeof chooseCardCommandSchema>;

/** A command to choose a card from the player's hand. */
export interface ChooseCardCommand {
  /** The player who is choosing the card. */
  player: PlayerSide;
  /** The card to choose from the player's hand. */
  card: Card;
}

// Helper type to check match of type against schema.
const _assertExactChooseCardCommand: AssertExact<
  ChooseCardCommand,
  ChooseCardCommandSchemaType
> = true;
