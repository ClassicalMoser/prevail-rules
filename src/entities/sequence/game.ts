import type { AssertExact } from "src/utils/assertExact.js";
import type { Army } from "../army/army.js";
import type { GameType } from "../gameType.js";
import type { Round } from "./round.js";
import type { Setup } from "./setup.js";

import { z } from "zod";
import { armySchema } from "../army/army.js";
import { gameTypeSchema } from "../gameType.js";
import { roundSchema } from "./round.js";
import { setupSchema } from "./setup.js";

/**
 * The schema for a complete game of Prevail: Ancient Battles.
 */
export const gameSchema = z.object({
  /** The unique identifier of the game. */
  id: z.string().uuid(),
  /** The type of game. */
  gameType: gameTypeSchema,
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: z.string().uuid(),
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: z.string().uuid(),
  /** The army brought by the black player. */
  blackArmy: armySchema,
  /** The army brought by the white player. */
  whiteArmy: armySchema,
  /** The setup of the game. */
  setup: setupSchema,
  /** The rounds of the game. */
  rounds: z.array(roundSchema),
});

// Helper type to check match of type against schema
type GameSchemaType = z.infer<typeof gameSchema>;

/**
 * A complete game of Prevail: Ancient Battles.
 */
export interface Game {
  /** The unique identifier of the game. */
  id: string;
  /** The type of game. */
  gameType: GameType;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The army brought by the black player. */
  blackArmy: Army;
  /** The army brought by the white player. */
  whiteArmy: Army;
  /** The setup of the game. */
  setup: Setup;
  /** The rounds of the game. */
  rounds: Round[];
}

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;
