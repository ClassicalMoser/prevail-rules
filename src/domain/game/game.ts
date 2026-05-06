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
} from "@entities";
import type { AssertExact } from "@utils";
import type { GameStateForBoard } from "./gameState";

import { armySchema } from "@entities";
import { z } from "zod";
import { largeGameStateSchema, smallGameStateSchema, standardGameStateSchema } from "./gameState";

/**
 * A **standard** game (`gameType === 'standard'`).
 * Every field is documented here so IDE hover does not jump through a shared base interface.
 */
export interface GameForMode<TGameMode extends GameMode> {
  gameType: TGameMode["name"];
  boardType: TGameMode["boardSize"];
  gameState: GameStateForBoard<BoardOfType<TGameMode["boardSize"]>>;
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
  gameType: z.literal("standard"),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  gameState: standardGameStateSchema,
  id: z.uuid(),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
});

type StandardGameSchemaType = z.infer<typeof _standardGameSchemaObject>;

const _assertExactStandardGame: AssertExact<
  GameForMode<StandardGameMode>,
  StandardGameSchemaType
> = true;

/** Validates a {@link Game} when `gameType` is known to be `standard`. */
export const standardGameSchema: z.ZodType<GameForMode<StandardGameMode>> =
  _standardGameSchemaObject;

const _miniGameSchemaObject = z.object({
  gameType: z.literal("mini"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  gameState: smallGameStateSchema,
  id: z.uuid(),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
});

type MiniGameSchemaType = z.infer<typeof _miniGameSchemaObject>;

const _assertExactMiniGame: AssertExact<GameForMode<MiniGameMode>, MiniGameSchemaType> = true;

export const miniGameSchema: z.ZodType<GameForMode<MiniGameMode>> = _miniGameSchemaObject;

const _tutorialGameSchemaObject = z.object({
  gameType: z.literal("tutorial"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  gameState: smallGameStateSchema,
  id: z.uuid(),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
});

type TutorialGameSchemaType = z.infer<typeof _tutorialGameSchemaObject>;

const _assertExactTutorialGame: AssertExact<
  GameForMode<TutorialGameMode>,
  TutorialGameSchemaType
> = true;

export const tutorialGameSchema: z.ZodType<GameForMode<TutorialGameMode>> =
  _tutorialGameSchemaObject;

const _epicGameSchemaObject = z.object({
  gameType: z.literal("epic"),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  gameState: largeGameStateSchema,
  id: z.uuid(),
  blackPlayer: z.uuid(),
  whitePlayer: z.uuid(),
  blackArmy: armySchema,
  whiteArmy: armySchema,
});

type EpicGameSchemaType = z.infer<typeof _epicGameSchemaObject>;

const _assertExactEpicGame: AssertExact<GameForMode<EpicGameMode>, EpicGameSchemaType> = true;

export const epicGameSchema: z.ZodType<GameForMode<EpicGameMode>> = _epicGameSchemaObject;

const _gameSchemaObject = z.discriminatedUnion("gameType", [
  _standardGameSchemaObject,
  _miniGameSchemaObject,
  _tutorialGameSchemaObject,
  _epicGameSchemaObject,
]);

type GameSchemaType = z.infer<typeof _gameSchemaObject>;

const _assertExactGame: AssertExact<Game, GameSchemaType> = true;

export const gameSchema: z.ZodType<Game> = _gameSchemaObject;
