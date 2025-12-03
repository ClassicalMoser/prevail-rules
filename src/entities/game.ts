import type { Army, GameType } from "@entities";
import type { AssertExact } from "@utils";
import { armySchema, gameTypeEnum } from "@entities";
import { z } from "zod";

/**
 * The schema for a complete game of Prevail: Ancient Battles.
 */
export const gameSchema = z.object({
  /** The unique identifier of the game. */
  id: z.string().uuid(),
  /** The type of game. */
  gameType: gameTypeEnum,
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: z.string().uuid(),
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: z.string().uuid(),
  /** The army brought by the black player. */
  blackArmy: armySchema,
  /** The army brought by the white player. */
  whiteArmy: armySchema,
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
}

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;
