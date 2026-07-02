import type { Game, GameState } from '@game';
import type { GameStorage } from '@application/ports';
import { getGame } from './getGame';
import type { GameModeName } from '@entities';

/**
 * Gets the game state for a given game.
 * @param gameId - The ID of the game to get the game state for.
 * @param gameMode - The mode of the game to get the game state for.
 * @param gameStorage - The game storage to use.
 * @returns The game state.
 */
export async function getGameState(
  gameId: string,
  gameMode: GameModeName,
  gameStorage: GameStorage,
): Promise<GameState | undefined> {
  const game: Game | undefined = await getGame(gameId, gameMode, gameStorage);
  if (!game) {
    return undefined;
  }

  return game.gameState;
}
