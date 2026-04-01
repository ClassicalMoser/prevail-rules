import type { Board, GameType } from '@entities';
import type { Game, GameState, GameStateWithBoard } from '@game';
import type { PortResponse } from './portResponse';

/**
 * Persistence for full game records and current {@link GameState}.
 * Implementations typically deal in JSON or DB rows; signatures use wide entity types on purpose.
 * Parse and narrow with `parseStoredGame` (e.g. via `getGame`) before driving rules.
 */
export interface GameStorage {
  getGame: (
    gameId: string,
    gameType: GameType,
  ) => Promise<PortResponse<Game | undefined>>;
  saveNewGame: <T extends GameType>(
    game: Game<T>,
  ) => Promise<PortResponse<void>>;
  /**
   * `gameState` is intentionally wide (`GameState`). {@link Game} ties `gameState` to
   * `gameType` (`GameStateWithBoard<BoardForGameType[T]>`), so merging into an existing `Game` usually
   * needs a single assertion (e.g. `{ ...game, gameState } as Game`) or a re-parse through
   * `parseStoredGame` / board-specific schemas—same as any JSON round-trip.
   */
  updateGameState: (
    gameId: string,
    gameState: GameState,
  ) => Promise<PortResponse<void>>;
}
