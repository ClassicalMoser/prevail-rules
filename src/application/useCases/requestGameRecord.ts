import type { GameModeName } from '@entities';
import type { GameStateVisibility, ProjectedGame } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';
import { getGame } from '@application/composable';
import { projectGameForVisibility } from '@transforms';

/**
 * Loads a game and returns it as one viewer may see it, so a client joining
 * or reloading a game in play gets its whole record at once: the opening
 * state, every event so far and the current state, all in its view. The
 * armies stay on the server, since each lists a hand only its own seat may
 * read.
 *
 * `requestGameStateSnapshot` is the cheaper answer when the client already
 * holds the record and only needs to catch up on the current state.
 *
 * @param gameId - The game to load
 * @param gameMode - The mode it is played in
 * @param visibility - What the viewer may see
 * @param ports - The process-level dependency context
 * @returns The game in that viewer's view, or the reason it could not be loaded
 */
export async function requestGameRecord(
  gameId: string,
  gameMode: GameModeName,
  visibility: GameStateVisibility,
  ports: EnginePorts,
): Promise<PortResponse<ProjectedGame>> {
  // The stored game is read as a legal one, and a missing or illegal game is
  // refused with its reason before anything is projected.
  const game = await getGame(gameId, gameMode, ports.gameStorage);
  if (!game.result) {
    return game;
  }

  // The viewer is sent only what its view may read.
  const projected = projectGameForVisibility(game.data, visibility);

  // The record, in the viewer's view.
  return {
    data: projected,
    result: true,
  };
}
