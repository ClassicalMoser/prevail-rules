import type { Army, GameType } from '@entities';
import type { SmallGameState, StandardGameState } from './gameState';

import { armySchema } from '@entities';
import { getBoardSizeForGameType } from '@ruleValues';
import { z } from 'zod';
import {
  gameStateSchemaForSmallBoard,
  gameStateSchemaForStandardBoard,
} from './gameState';

/** Shared fields for every stored game record (discriminated by `gameType`). */
export interface GameBase {
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

export interface StandardGame extends GameBase {
  gameType: 'standard';
  gameState: StandardGameState;
}

export interface MiniGame extends GameBase {
  gameType: 'mini';
  gameState: SmallGameState;
}

export interface TutorialGame extends GameBase {
  gameType: 'tutorial';
  gameState: SmallGameState;
}

/**
 * A complete game, discriminated by `gameType`.
 * Narrow with `game.gameType === 'standard'` → {@link StandardGame} and {@link StandardGameState}.
 */
export type Game = StandardGame | MiniGame | TutorialGame;

/** The {@link Game} branch for a literal {@link GameType}. */
export type GameOfType<T extends GameType> = Extract<Game, { gameType: T }>;

/**
 * Board type for a {@link GameType}, derived from the {@link Game} union (`mini` / `tutorial` → {@link SmallGameState}).
 */
export type BoardForGameType<T extends GameType> =
  GameOfType<T>['gameState']['boardState'];

/**
 * Whether `gameState.boardState` matches the board family for `gameType` per {@link gameTypes} / {@link getBoardSizeForGameType}.
 */
export function validateGameBoardMatchesGameType(game: Game): boolean {
  const expected = getBoardSizeForGameType(game.gameType);
  const bt = game.gameState.boardState.boardType;
  return (
    (expected === 'standard' && bt === 'standard') ||
    (expected === 'small' && bt === 'small')
  );
}

const _standardGameSchemaObject = z.object({
  id: z.uuid(),
  gameType: z.literal('standard'),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
  gameState: gameStateSchemaForStandardBoard,
});

const _miniGameSchemaObject = z.object({
  id: z.uuid(),
  gameType: z.literal('mini'),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
  gameState: gameStateSchemaForSmallBoard,
});

const _tutorialGameSchemaObject = z.object({
  id: z.uuid(),
  gameType: z.literal('tutorial'),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
  gameState: gameStateSchemaForSmallBoard,
});

/** Validates a {@link Game} when `gameType` is known to be `standard`. */
export const standardGameSchema =
  _standardGameSchemaObject as z.ZodType<StandardGame>;

/** Validates a {@link Game} when `gameType` is known to be `mini`. */
export const miniGameSchema = _miniGameSchemaObject as z.ZodType<MiniGame>;

/** Validates a {@link Game} when `gameType` is known to be `tutorial`. */
export const tutorialGameSchema =
  _tutorialGameSchemaObject as z.ZodType<TutorialGame>;

const _gameDiscriminatedUnion = z.discriminatedUnion('gameType', [
  _standardGameSchemaObject,
  _miniGameSchemaObject,
  _tutorialGameSchemaObject,
]);

/**
 * Schema for any {@link Game}. Also checks {@link validateGameBoardMatchesGameType}.
 *
 * When `gameType` is fixed, prefer {@link standardGameSchema} / {@link miniGameSchema} / {@link tutorialGameSchema}.
 */
export const gameSchema = _gameDiscriminatedUnion.superRefine((g, ctx) => {
  if (!validateGameBoardMatchesGameType(g)) {
    ctx.addIssue({
      code: 'custom',
      message:
        'gameState.boardState.boardType does not match gameType per @ruleValues/gameTypes',
      path: ['gameState', 'boardState'],
    });
  }
}) as z.ZodType<Game>;
