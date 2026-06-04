import type {
  Army,
  BoardOfType,
  EpicGameMode,
  GameMode,
  LargeBoard,
  MiniGameMode,
  SmallBoard,
  StandardBoard,
  StandardGameMode,
  TutorialGameMode,
} from '@entities';
import type { AssertExact } from '@utils';
import type { GameStateForBoard } from './gameState';

import { armySchema } from '@entities';
import { z } from 'zod';
import {
  largeGameStateSchema,
  smallGameStateSchema,
  standardGameStateSchema,
} from './gameState';

/**
 * Every field is documented here so IDE hover does not jump through a shared base interface.
 */
export interface GameForMode<TGameMode extends GameMode> {
  gameMode: TGameMode['name'];
  boardType: TGameMode['boardSize'];
  gameState: GameStateForBoard<BoardOfType<TGameMode['boardSize']>>;
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

export type Game =
  | GameForMode<StandardGameMode>
  | GameForMode<MiniGameMode>
  | GameForMode<TutorialGameMode>
  | GameForMode<EpicGameMode>;

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _standardGameSchemaObject = z.object({
  blackArmy: armySchema,
  blackPlayer: z.uuid(),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  gameState: standardGameStateSchema,
  gameMode: z.literal('standard'),
  id: z.uuid(),
  whiteArmy: armySchema,
  whitePlayer: z.uuid(),
});

type StandardGameSchemaType = z.infer<typeof _standardGameSchemaObject>;

const _assertExactStandardGame: AssertExact<
  GameForMode<StandardGameMode>,
  StandardGameSchemaType
> = true;

/** Validates a {@link Game} when `gameMode` is known to be `standard`. */
export const standardGameSchema: z.ZodType<GameForMode<StandardGameMode>> =
  _standardGameSchemaObject;

const _miniGameSchemaObject = z.object({
  blackArmy: armySchema,
  blackPlayer: z.uuid(),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  gameState: smallGameStateSchema,
  gameMode: z.literal('mini'),
  id: z.uuid(),
  whiteArmy: armySchema,
  whitePlayer: z.uuid(),
});

type MiniGameSchemaType = z.infer<typeof _miniGameSchemaObject>;

const _assertExactMiniGame: AssertExact<
  GameForMode<MiniGameMode>,
  MiniGameSchemaType
> = true;

export const miniGameSchema: z.ZodType<GameForMode<MiniGameMode>> =
  _miniGameSchemaObject;

const _tutorialGameSchemaObject = z.object({
  blackArmy: armySchema,
  blackPlayer: z.uuid(),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  gameState: smallGameStateSchema,
  gameMode: z.literal('tutorial'),
  id: z.uuid(),
  whiteArmy: armySchema,
  whitePlayer: z.uuid(),
});

type TutorialGameSchemaType = z.infer<typeof _tutorialGameSchemaObject>;

const _assertExactTutorialGame: AssertExact<
  GameForMode<TutorialGameMode>,
  TutorialGameSchemaType
> = true;

export const tutorialGameSchema: z.ZodType<GameForMode<TutorialGameMode>> =
  _tutorialGameSchemaObject;

const _epicGameSchemaObject = z.object({
  blackArmy: armySchema,
  blackPlayer: z.uuid(),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  gameState: largeGameStateSchema,
  gameMode: z.literal('epic'),
  id: z.uuid(),
  whiteArmy: armySchema,
  whitePlayer: z.uuid(),
});

type EpicGameSchemaType = z.infer<typeof _epicGameSchemaObject>;

const _assertExactEpicGame: AssertExact<
  GameForMode<EpicGameMode>,
  EpicGameSchemaType
> = true;

export const epicGameSchema: z.ZodType<GameForMode<EpicGameMode>> =
  _epicGameSchemaObject;

const _gameSchemaObject = z.discriminatedUnion('gameMode', [
  _standardGameSchemaObject,
  _miniGameSchemaObject,
  _tutorialGameSchemaObject,
  _epicGameSchemaObject,
]);

type GameSchemaType = z.infer<typeof _gameSchemaObject>;

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;

export const gameSchema: z.ZodType<Game> = _gameSchemaObject;
