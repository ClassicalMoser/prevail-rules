import type { Game, GameState } from '@game';
import type { PortResponse } from './portResponse';
import type { GameModeName } from '@entities';

/**
 * Persistence for full game records and current {@link GameState}.
 * Implementations typically deal in JSON or DB rows, so a stored game comes
 * back untyped: `getGame` in `@application/composable` reads it as a legal
 * {@link Game} before anything drives rules with it.
 */
export interface GameStorage {
  getGame: (
    gameId: string,
    gameMode: GameModeName,
  ) => Promise<PortResponse<unknown> | undefined>;
  saveNewGame: (game: Game) => Promise<PortResponse<void>>;
  /**
   * `gameState` is intentionally wide. Merge into an existing {@link Game} via
   * `{ ...game, gameState }`; it is read again as a legal game when next loaded.
   */
  updateGameState: (
    gameId: string,
    gameState: GameState,
  ) => Promise<PortResponse<void>>;
}
