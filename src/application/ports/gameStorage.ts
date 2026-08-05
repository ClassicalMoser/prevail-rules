import type { Game, GameState } from '@game';
import type { PortResponse } from './portResponse';
import type { GameModeName } from '@entities';

/**
 * Persistence for full game records and current {@link GameState}.
 * Implementations typically deal in JSON or DB rows; signatures use wide entity types on purpose.
 * Parse and narrow with `parseStoredGame` (e.g. via `getGame`) before driving rules.
 */
export interface GameStorage {
  getGame(
    gameId: string,
    gameMode: GameModeName,
  ): Promise<PortResponse<Game> | undefined>;
  saveNewGame(game: Game): Promise<PortResponse<void>>;
  /**
   * `gameState` is intentionally wide. Merge into an existing {@link Game} via
   * `{ ...game, gameState }` or re-parse through {@link parseStoredGame}.
   */
  updateGameState: (
    gameId: string,
    gameState: GameState,
  ) => Promise<PortResponse<void>>;
}
