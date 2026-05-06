import type { BoardOfType, GameMode } from "@entities";
import type { GameStateForBoard } from "@game";
import type { RoundSnapshotStorage } from "../ports";
import { parseStoredGameForMode } from "../utils/parseStoredGame";

/**
 * Loads via `RoundSnapshotStorage` (wide types), then `parseStoredGameState`;
 * yields correlated board state.
 *
 * @param gameId - The ID of the game.
 * @param roundNumber - The number of the round.
 * @param gameMode - The mode of the game.
 * @param roundSnapshotStorage - The storage for round snapshots.
 * @returns The round snapshot.
 */
export async function getRoundSnapshot<TGameMode extends GameMode>(
  gameId: string,
  roundNumber: number,
  gameMode: TGameMode,
  roundSnapshotStorage: RoundSnapshotStorage,
): Promise<GameStateForBoard<BoardOfType<TGameMode["boardSize"]>> | undefined> {
  const result = await roundSnapshotStorage.getRoundSnapshot(gameId, roundNumber);
  if (!result.result) {
    throw new Error(result.errorReason ?? "Unknown error");
  }
  if (result.data === undefined) {
    return undefined;
  }
  return parseStoredGameForMode<TGameMode>(gameMode, result.data).gameState;
}
