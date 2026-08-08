import type { GameModeName } from '@entities';
import type { EnginePorts, PortResponse } from '@application/ports';
import { getGame } from '@application/composable';
import { advanceEffects } from '@application/process';
import { isAuthoritativeGameState } from '@game';

/**
 * Runs chained game effects until the next player-facing choice (or failure).
 * Idempotent when a player choice is already expected.
 */
export async function advanceUntilPlayerChoice(
  gameId: string,
  gameMode: GameModeName,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  const game = await getGame(gameId, gameMode, ports.gameStorage);
  if (game === undefined) {
    return {
      errorReason: `Game ${gameId} not found`,
      result: false,
    };
  }

  if (!isAuthoritativeGameState(game.gameState)) {
    return {
      errorReason: 'Engine requires authoritative game state',
      result: false,
    };
  }

  return advanceEffects(gameId, gameMode, game.gameState, ports);
}
