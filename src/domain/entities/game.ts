import type { Army, GameType } from '@entities';
import type { AssertExact } from '@utils';
import { armySchema, gameTypeEnum } from '@entities';
import { z } from 'zod';

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

const _gameSchemaObject = z.object({
  /** The unique identifier of the game. */
  id: z.uuid(),
  /** The type of game. */
  gameType: gameTypeEnum,
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: z.uuid(),
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: z.uuid(),
  /** The army brought by the black player. */
  blackArmy: armySchema,
  /** The army brought by the white player. */
  whiteArmy: armySchema,
});

type GameSchemaType = z.infer<typeof _gameSchemaObject>;

/**
 * The schema for a complete game of Prevail: Ancient Battles.
 */
export const gameSchema: z.ZodType<Game> = _gameSchemaObject;

// Verify manual type matches schema inference
const _assertExactGame: AssertExact<Game, GameSchemaType> = true;
