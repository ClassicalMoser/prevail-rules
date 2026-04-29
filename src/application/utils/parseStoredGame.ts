import type { GameType } from "@entities";
import type { Game, MiniGame, StandardGame, TutorialGame } from "@game";
import { miniGameSchema, standardGameSchema, tutorialGameSchema } from "@game";

/**
 * **Boundary:** validates untrusted / stored data and returns a typed {@link Game}.
 * Call after `GameStorage.getGame` (or equivalent) so downstream code can narrow on `gameType`.
 */

/** Interpret game object as specific {@link GameType} using the Zod schema. */
export function parseStoredGame(gameType: "standard", data: unknown): StandardGame;
export function parseStoredGame(gameType: "mini", data: unknown): MiniGame;
export function parseStoredGame(gameType: "tutorial", data: unknown): TutorialGame;
/** When `gameType` is only known as {@link GameType}, the result is the wide {@link Game} union. */
export function parseStoredGame(gameType: GameType, data: unknown): Game;
export function parseStoredGame(gameType: GameType, data: unknown): Game {
  switch (gameType) {
    case "standard": {
      const parsed = standardGameSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return parsed.data;
    }
    case "mini": {
      const parsed = miniGameSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return parsed.data;
    }
    case "tutorial": {
      const parsed = tutorialGameSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      return parsed.data;
    }
    default: {
      const _exhaustive: never = gameType;
      throw new Error(`Unknown gameType: ${_exhaustive}`);
    }
  }
}
