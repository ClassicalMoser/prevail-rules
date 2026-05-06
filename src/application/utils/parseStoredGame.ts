import type { GameMode, GameModeName } from "@entities";
import type { Game, GameForMode } from "@game";
import {
  epicGameSchema,
  gameSchema,
  miniGameSchema,
  standardGameSchema,
  tutorialGameSchema,
} from "@game";

/**
 * **Boundary:** validates untrusted / stored data and returns a typed {@link Game}.
 * Call after `GameStorage.getGame` (or equivalent) so downstream code can narrow on `gameType`.
 */

/**
 * Interpret stored JSON using the Zod schema for the given {@link GameMode}.
 *
 * @warning This function relies on two assumptions:
 * 1. The game mode name is an effective discriminant on both the type and the zod schema.
 * 2. The zod schema is asserted to match the type exactly and passes compile-time checks.
 *
 * In the case of generic game mode assertion, it will return broadly.
 * If the return sub-type matters, specify the type parameter more narrowly.
 */
export function parseStoredGameForMode<TGameMode extends GameMode>(
  gameMode: TGameMode,
  data: unknown,
): GameForMode<TGameMode> {
  const modeName: GameModeName = gameMode.name;
  let game;
  switch (modeName) {
    case "tutorial":
      game = tutorialGameSchema.parse(data);
      break;
    case "mini":
      game = miniGameSchema.parse(data);
      break;
    case "standard":
      game = standardGameSchema.parse(data);
      break;
    case "epic":
      game = epicGameSchema.parse(data);
      break;
    default: {
      const _exhaustive: never = modeName;
      throw new Error(`Unknown gameType: ${_exhaustive}`);
    }
  }
  return game as GameForMode<TGameMode>;
}

/** Broad version of {@link parseStoredGameForMode} that accepts any stored shape (mode in payload). */
export function parseStoredGame(data: unknown): Game {
  const parsed: Game = gameSchema.parse(data);
  // Return on its own line for easier debugging.
  return parsed;
}
