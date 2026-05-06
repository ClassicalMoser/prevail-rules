import type { Game, GameState } from "@game";
import type { GameStorage } from "../ports";
import { getGame } from "./getGame";

/**
 * Gets the game state for a given game.
 * @param gameId - The ID of the game to get the game state for.
 * @param gameStorage - The game storage to use.
 * @returns The game state.
 */
export async function getGameState(
  gameId: string,
  gameStorage: GameStorage,
): Promise<GameState | undefined> {
  const game: Game | undefined = await getGame(gameId, gameStorage);
  if (!game) {
    return undefined;
  }

  return game.gameState;
}
