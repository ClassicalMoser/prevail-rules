import type { PlayerCardState } from '@entities';
import type { AssertExact } from '@utils';
import { z } from 'zod';
import { playerCardStateSchema } from './playerCardState';

/** The schema for the state of all cards in the game. */
const _cardStateSchemaObject = z.object({
  /** The state of the cards for the black player. */
  blackPlayer: playerCardStateSchema,
  /** The state of the cards for the white player. */
  whitePlayer: playerCardStateSchema,
});

type CardStateSchemaType = z.infer<typeof _cardStateSchemaObject>;
export const cardStateSchema: z.ZodType<CardState> = _cardStateSchemaObject;

/** The state of all cards in the game. */
export interface CardState {
  /** The state of the cards for the black player. */
  blackPlayer: PlayerCardState;
  /** The state of the cards for the white player. */
  whitePlayer: PlayerCardState;
}

/** Helper function to assert that a value matches the schema. */
const _assertExactCardState: AssertExact<CardState, CardStateSchemaType> = true;
