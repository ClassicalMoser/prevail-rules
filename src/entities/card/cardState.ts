import type { AssertExact } from "src/utils/assertExact.js";
import type { PlayerCardState } from "./playerCardState.js";

import { z } from "zod";
import { playerCardStateSchema } from "./playerCardState.js";

/** The schema for the state of all cards in the game. */
export const cardStateSchema = z.object({
  /** The state of the cards for the black player. */
  blackPlayer: playerCardStateSchema,
  /** The state of the cards for the white player. */
  whitePlayer: playerCardStateSchema,
});

// Helper type to check match of type against schema
type CardStateSchemaType = z.infer<typeof cardStateSchema>;

/** The state of all cards in the game. */
export interface CardState {
  /** The state of the cards for the black player. */
  blackPlayer: PlayerCardState;
  /** The state of the cards for the white player. */
  whitePlayer: PlayerCardState;
}

/** Helper function to assert that a value matches the schema. */
const _assertExactCardState: AssertExact<CardState, CardStateSchemaType> = true;
