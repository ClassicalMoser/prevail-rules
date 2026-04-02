import type { GameType } from '@entities';
import type { BoardForGameType, GameStateWithBoard } from '@game';
import type { RoundSnapshotStorage } from '../ports';
import { parseStoredGameState } from '../utils';

/** Loads via `RoundSnapshotStorage` (wide types), then `parseStoredGameState`; yields correlated board state. */
export async function getRoundSnapshot<T extends GameType>(
  gameId: string,
  roundNumber: number,
  gameType: T,
  roundSnapshotStorage: RoundSnapshotStorage,
): Promise<GameStateWithBoard<BoardForGameType<T>> | undefined> {
  const result = await roundSnapshotStorage.getRoundSnapshot(
    gameId,
    roundNumber,
  );
  if (!result.result) {
    throw new Error(result.errorReason ?? 'Unknown error');
  }
  if (result.data === undefined) {
    return undefined;
  }
  return parseStoredGameState(gameType, result.data) as GameStateWithBoard<
    BoardForGameType<T>
  >;
}
