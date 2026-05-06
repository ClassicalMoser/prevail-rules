import type { Game } from "@game";
import type { GameStorage } from "../ports";

/**
 * Loads via `GameStorage` (wide types), then {@link parseStoredGameForMode}.
 */
export async function getGame(gameId: string, gameStorage: GameStorage): Promise<Game | undefined> {
  const result = await gameStorage.getGame(gameId);
  if (!result || result.result === false || result.data === undefined) {
    return undefined;
  }
  return result.data;
}
