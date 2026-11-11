import type { AuthoritativeGameState } from '@game';
import type { GameStorage, PortResponse } from '@application/ports';
import type { GameModeName } from '@entities';
import { getGame } from './getGame';

/**
 * Loads a game and returns its state, which is authoritative: the server's
 * record of play, before any projection for a viewer.
 *
 * @param gameId - The ID of the game
 * @param gameMode - The mode the game must be in
 * @param gameStorage - The storage to load it from
 * @returns The game state, or the reason the game could not be loaded
 */
export async function getGameState(
  gameId: string,
  gameMode: GameModeName,
  gameStorage: GameStorage,
): Promise<PortResponse<AuthoritativeGameState>> {
  const game = await getGame(gameId, gameMode, gameStorage);
  if (!game.result) {
    return game;
  }
  const state = { data: game.data.gameState, result: true as const };
  return state;
}
