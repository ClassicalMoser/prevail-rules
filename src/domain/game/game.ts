import type { Army, GameType, SmallBoard, StandardBoard } from '@entities';
import type { GameState } from './gameState';

import { armySchema, gameTypeEnum } from '@entities';
import { z } from 'zod';
import {
  gameStateSchema,
  gameStateSchemaForSmallBoard,
  gameStateSchemaForStandardBoard,
} from './gameState';

/**
 * Board shape required for each {@link GameType}.
 * Keep aligned with {@link gameTypes} in `@ruleValues/gameTypes` (runtime check uses that list).
 */
export interface BoardForGameType {
  standard: StandardBoard;
  mini: SmallBoard;
  tutorial: SmallBoard;
}

/**
 * A complete game of Prevail: Ancient Battles.
 *
 * @typeParam T - Game variant; `gameState` is typed to the board that matches `gameType`.
 */
export interface Game<T extends GameType = GameType> {
  /** The unique identifier of the game. */
  id: string;
  /** The type of game. */
  gameType: T;
  /** The unique identifier of the player on the black side of the game. */
  blackPlayer: string;
  /** The unique identifier of the player on the white side of the game. */
  whitePlayer: string;
  /** The army brought by the black player. */
  blackArmy: Army;
  /** The army brought by the white player. */
  whiteArmy: Army;
  /** The state of the game. */
  gameState: GameState<BoardForGameType[T]>;
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
  /** The state of the game. */
  gameState: gameStateSchema,
});

/**
 * The schema for a complete game of Prevail: Ancient Battles.
 * Cross-checks `gameType` against `gameState.boardState.boardType` using `@ruleValues/gameTypes`.
 *
 * Output is typed as `Game<GameType>`. Zod infers `gameState` as the wide board union;
 * `superRefine` enforces the board family at runtime.
 *
 * @remarks The board-family relation is not a Zod refine on this object: use
 * {@link validateGameBoardMatchesGameType} at the call site, or {@link standardGameSchema} /
 * {@link miniGameSchema} / {@link tutorialGameSchema} when the game type is fixed.
 */
export const gameSchema = _gameSchemaObject as z.ZodType<Game<GameType>>;

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
export const standardGameSchema = _standardGameSchemaObject as z.ZodType<
  Game<'standard'>
>;

/** Validates a {@link Game} when `gameType` is known to be `mini`. */
export const miniGameSchema = _miniGameSchemaObject as z.ZodType<Game<'mini'>>;

/** Validates a {@link Game} when `gameType` is known to be `tutorial`. */
export const tutorialGameSchema = _tutorialGameSchemaObject as z.ZodType<
  Game<'tutorial'>
>;
