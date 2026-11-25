import type { GameModeName } from '@ruleValues';
import type { GameState, GameStateVisibility } from '@game';
import type { EnginePorts, RunnerResponse } from '@application/ports';
import { getGame } from '@application/composable';
import { projectGameStateForVisibility } from '@transforms';

/**
 * Loads the current authoritative game and returns its state as one viewer
 * may see it, for client reconcile (refresh / missed updates / broken local
 * view). A client gets the game state it may see, not the server's game record.
 *
 * Board units are never redacted. A seat hides the opponent's hand; a
 * spectator hides both hands and both awaiting-play cards; the authoritative
 * view hides nothing, for a viewer the server lets see every card.
 *
 * `requestGameRecord` takes the same visibility and sends the whole record:
 * the opening state and every event as well as this current state.
 *
 * @param gameId - The game to load
 * @param gameMode - The mode it is played in
 * @param visibility - What the viewer may see
 * @param ports - The process-level dependency context
 * @returns The current state in that viewer's view, or the cause and reason it could not be loaded
 */
export async function requestGameStateSnapshot(
  gameId: string,
  gameMode: GameModeName,
  visibility: GameStateVisibility,
  ports: EnginePorts,
): Promise<RunnerResponse<GameState>> {
  // The stored game is read as a legal one, and a missing or illegal game is
  // refused with its reason before anything is projected.
  const game = await getGame(gameId, gameMode, ports.gameStorage);
  if (!game.result) {
    return game;
  }

  // The viewer is sent only the cards its view may read.
  const projected = projectGameStateForVisibility(
    game.data.gameState,
    visibility,
  );

  // The current state, in the viewer's view.
  return {
    data: projected,
    result: true,
  };
}
