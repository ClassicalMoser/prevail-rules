import type { Card, PlayerSide } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema, playerSideSchema } from '@entities';
import { z } from 'zod';

/** A command to choose a card from the player's hand. */
export interface ChooseCardCommand {
  /** The player who is choosing the card. */
  player: PlayerSide;
  /** The card to choose from the player's hand. */
  card: Card;
}

const _chooseCardCommandSchemaObject = z.object({
  /** The player who is choosing the card. */
  player: playerSideSchema,
  /** The card to choose from the player's hand. */
  card: cardSchema,
});

type ChooseCardCommandSchemaType = z.infer<
  typeof _chooseCardCommandSchemaObject
>;

/** The schema for a choose card command. */
export const chooseCardCommandSchema: z.ZodType<ChooseCardCommand> =
  _chooseCardCommandSchemaObject;

// Verify manual type matches schema inference
const _assertExactChooseCardCommand: AssertExact<
  ChooseCardCommand,
  ChooseCardCommandSchemaType
> = true;
