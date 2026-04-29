import type { GameType } from "@entities";
import type { MiniGame } from "./miniGame";
import type { StandardGame } from "./standardGame";
import type { TutorialGame } from "./tutorialGame";

import { getBoardSizeForGameType } from "@ruleValues";
import { z } from "zod";
import { miniGameSchema } from "./miniGame";
import { standardGameSchema } from "./standardGame";
import { tutorialGameSchema } from "./tutorialGame";

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
export type BoardForGameType<T extends GameType> = GameOfType<T>["gameState"]["boardState"];

/**
 * Whether `gameState.boardType` (and nested `boardState.boardType`) match the board family for
 * `gameType` per {@link gameTypes} / {@link getBoardSizeForGameType}.
 */
export function validateGameBoardMatchesGameType(game: Game): boolean {
  const root = game.gameState.boardType;
  const nested = game.gameState.boardState.boardType;
  if (root !== nested) {
    return false;
  }
  const expected = getBoardSizeForGameType(game.gameType);
  return (
    (expected === "standard" && root === "standard") || (expected === "small" && root === "small")
  );
}

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------

const _gameDiscriminatedUnion = z.discriminatedUnion("gameType", [
  standardGameSchema,
  miniGameSchema,
  tutorialGameSchema,
] as unknown as Parameters<typeof z.discriminatedUnion>[1]);

/**
 * Schema for any {@link Game}. Also checks {@link validateGameBoardMatchesGameType}.
 *
 * When `gameType` is fixed, prefer {@link standardGameSchema} / {@link miniGameSchema} / {@link tutorialGameSchema}.
 */
export const gameSchema = _gameDiscriminatedUnion.superRefine((g, ctx) => {
  if (!validateGameBoardMatchesGameType(g as Game)) {
    ctx.addIssue({
      code: "custom",
      message:
        "gameState.boardType / boardState.boardType do not match gameType per @ruleValues/gameTypes",
      path: ["gameState", "boardType"],
    });
  }
}) as z.ZodType<Game>;

export type { MiniGame } from "./miniGame";
export { miniGameSchema } from "./miniGame";
export type { StandardGame } from "./standardGame";
export { standardGameSchema } from "./standardGame";
export type { TutorialGame } from "./tutorialGame";
export { tutorialGameSchema } from "./tutorialGame";
