import type { Board, Game, GameState, GameType } from '@entities';
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
  updateGameState: <TBoard extends Board>(
    gameId: string,
    gameState: GameState<TBoard>,
  ) => Promise<PortResponse<void>>;
}
