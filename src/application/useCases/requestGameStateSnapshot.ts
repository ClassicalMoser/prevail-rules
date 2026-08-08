import type { GameModeName, PlayerSide } from '@entities';
import type { Game, GameForVisibility } from '@game';
import { isAuthoritativeGameState } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';
import { getGame } from '@application/composable';
import { projectGameForVisibility } from '@transforms';

/**
 * Loads the current authoritative game and returns a seat-projected snapshot
 * for client reconcile (refresh / missed updates / broken local view).
 *
 * Board units are never redacted — only the opponent card slice is hidden.
 */
export async function requestGameStateSnapshot(
  gameId: string,
  gameMode: GameModeName,
  playerSide: PlayerSide,
  ports: EnginePorts,
): Promise<PortResponse<Game>> {
  const game = await getGame(gameId, gameMode, ports.gameStorage);
  if (!game) {
    return {
      errorReason: 'Game not found',
      result: false,
    };
  }

  if (!isAuthoritativeGameState(game.gameState)) {
    return {
      errorReason: 'Engine requires authoritative game state',
      result: false,
    };
  }

  const authoritative = game as GameForVisibility<'authoritative'>;
  const visibility = playerSide === 'white' ? 'whiteSeen' : 'blackSeen';
  const projected = projectGameForVisibility(authoritative, visibility);

  return {
    data: projected,
    result: true,
  };
}
