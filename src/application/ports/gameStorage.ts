import type { Event } from '@events';
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
   * Records one event on a stored game: the event joins the end of the game's
   * stream, and the state it led to replaces the game's state, together, so
   * the record and its latest state never disagree.
   * `gameState` is intentionally wide; it is read again as a legal game when
   * next loaded.
   */
  recordEvent: (
    gameId: string,
    event: Event,
    gameState: GameState,
  ) => Promise<PortResponse<void>>;
}
