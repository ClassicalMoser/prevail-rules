import type { Army, BoardType, GameModeName } from '@entities';
import type { AssertExact } from '@utils';
import type { GameStateForVisibility, GameStateVisibility } from './gameState';

import {
  armySchema,
  gameModeNames,
  gameModes,
  refineArmyComposition,
} from '@entities';
import { z } from 'zod';
import {
  authoritativeGameStateSchema,
  blackSeenGameStateSchema,
  whiteSeenGameStateSchema,
} from './gameState';

/**
 * A game for a card visibility regime.
 * Board size lives on `gameState.boardState.boardType` and must agree with
 * the size required by {@link gameMode} (enforced by Zod).
 *
 * @param V - Card visibility (`authoritative` | `whiteSeen` | `blackSeen`)
 */
export interface GameForVisibility<
  V extends GameStateVisibility = 'authoritative',
> {
  gameMode: GameModeName;
  gameState: GameStateForVisibility<V>;
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

/** Every visibility combination. */
export type Game =
  | GameForVisibility<'authoritative'>
  | GameForVisibility<'whiteSeen'>
  | GameForVisibility<'blackSeen'>;

function expectedBoardSize(gameMode: GameModeName): BoardType {
  const mode = gameModes.find((m) => m.name === gameMode);
  if (!mode) {
    throw new Error(`Unknown game mode: ${gameMode}`);
  }
  return mode.boardSize;
}

function refineGameModeBoardSize(
  game: {
    gameMode: GameModeName;
    gameState: { boardState: { boardType: BoardType } };
  },
  ctx: z.RefinementCtx,
): void {
  const expected = expectedBoardSize(game.gameMode);
  const actual = game.gameState.boardState.boardType;
  if (actual !== expected) {
    ctx.addIssue({
      code: 'custom',
      message: `gameMode ${game.gameMode} requires board size ${expected}, got ${actual}.`,
      path: ['gameState', 'boardState', 'boardType'],
    });
  }
}

function refineGameModeConstraints(
  game: {
    gameMode: GameModeName;
    gameState: { boardState: { boardType: BoardType } };
    blackArmy: Army;
    whiteArmy: Army;
  },
  ctx: z.RefinementCtx,
): void {
  refineGameModeBoardSize(game, ctx);
  refineArmyComposition(game.whiteArmy, game.gameMode, ctx, ['whiteArmy']);
  refineArmyComposition(game.blackArmy, game.gameMode, ctx, ['blackArmy']);
}

const _authoritativeGameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    gameMode: z.enum(gameModeNames),
    gameState: authoritativeGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict()
  .superRefine(refineGameModeConstraints);

type AuthoritativeGameSchemaType = z.infer<
  typeof _authoritativeGameSchemaObject
>;

const _assertExactAuthoritativeGame: AssertExact<
  GameForVisibility<'authoritative'>,
  AuthoritativeGameSchemaType
> = true;

export const authoritativeGameSchema: z.ZodType<
  GameForVisibility<'authoritative'>
> = _authoritativeGameSchemaObject;

const _whiteSeenGameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    gameMode: z.enum(gameModeNames),
    gameState: whiteSeenGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict()
  .superRefine(refineGameModeConstraints);

type WhiteSeenGameSchemaType = z.infer<typeof _whiteSeenGameSchemaObject>;

const _assertExactWhiteSeenGame: AssertExact<
  GameForVisibility<'whiteSeen'>,
  WhiteSeenGameSchemaType
> = true;

export const whiteSeenGameSchema: z.ZodType<GameForVisibility<'whiteSeen'>> =
  _whiteSeenGameSchemaObject;

const _blackSeenGameSchemaObject = z
  .object({
    blackArmy: armySchema,
    blackPlayer: z.uuid(),
    gameMode: z.enum(gameModeNames),
    gameState: blackSeenGameStateSchema,
    id: z.uuid(),
    whiteArmy: armySchema,
    whitePlayer: z.uuid(),
  })
  .strict()
  .superRefine(refineGameModeConstraints);

type BlackSeenGameSchemaType = z.infer<typeof _blackSeenGameSchemaObject>;

const _assertExactBlackSeenGame: AssertExact<
  GameForVisibility<'blackSeen'>,
  BlackSeenGameSchemaType
> = true;

export const blackSeenGameSchema: z.ZodType<GameForVisibility<'blackSeen'>> =
  _blackSeenGameSchemaObject;

const _gameSchemaObject = z.union([
  _authoritativeGameSchemaObject,
  _whiteSeenGameSchemaObject,
  _blackSeenGameSchemaObject,
]);

type GameSchemaType = z.infer<typeof _gameSchemaObject>;

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;

export const gameSchema: z.ZodType<Game> = _gameSchemaObject;
