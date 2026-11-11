import type { GameModeName } from '@entities';
import type { EnginePorts, PortResponse } from '@application/ports';
import { getGame } from '@application/composable';
import { advanceEffects } from '@application/process';

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
  if (!game.result) {
    return game;
  }

  const advanced = await advanceEffects(
    gameId,
    gameMode,
    game.data.gameState,
    ports,
  );
  return advanced;
}
