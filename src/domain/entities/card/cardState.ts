import type { PlayerCardState } from '@entities';
import type { AssertExact } from '@utils';
import { z } from 'zod';
import { playerCardStateSchema } from './playerCardState';

/** The state of all cards in the game. */
export interface CardState {
  /** The state of the cards for the black player. */
  blackPlayer: PlayerCardState;
  /** The state of the cards for the white player. */
  whitePlayer: PlayerCardState;
}

const _cardStateSchemaObject = z.object({
  /** The state of the cards for the black player. */
  blackPlayer: playerCardStateSchema,
  /** The state of the cards for the white player. */
  whitePlayer: playerCardStateSchema,
});

type CardStateSchemaType = z.infer<typeof _cardStateSchemaObject>;

/** The schema for the state of all cards in the game. */
export const cardStateSchema: z.ZodType<CardState> = _cardStateSchemaObject;

// Verify manual type matches schema inference
const _assertExactCardState: AssertExact<CardState, CardStateSchemaType> = true;
