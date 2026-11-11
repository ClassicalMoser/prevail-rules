import type { Army, GameModeName } from '@entities';
import type { AssertExact } from '@utils';
import type { GameStateForVisibility } from '@game/gameState';

import { armySchema, gameModeNames } from '@entities';
import { z } from 'zod';
import { authoritativeGameStateSchema } from '@game/gameState';

/**
 * A game as the server keeps it: who plays, with which armies, in which mode,
 * and the full state of play. It is the authoritative record; a player's or
 * a spectator's view is a projection of its game state, not of the game.
 *
 * Board size lives on `gameState.boardState.boardType` and must agree with
 * the size required by {@link gameMode} (enforced by Zod).
 *
 * Mode army composition limits live in `@legality` (`refineGameArmyComposition`).
 */
export interface Game {
  gameMode: GameModeName;
  gameState: GameStateForVisibility<'authoritative'>;
  /** The unique identifier of the game. */
  id: string;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The army brought by the black player. */
  blackArmy: Army;
  /** The army brought by the white player. */
  whiteArmy: Army;
}

const _gameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    gameMode: z.enum(gameModeNames),
    gameState: authoritativeGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict();

type GameSchemaType = z.infer<typeof _gameSchemaObject>;

/** Schema for {@link Game}. */
export const gameSchema: z.ZodType<Game> = _gameSchemaObject;

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;
