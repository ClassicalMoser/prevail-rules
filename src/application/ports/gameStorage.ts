import type { Game, GameState } from "@game";
import type { PortResponse } from "./portResponse";

/**
 * Persistence for full game records and current {@link GameState}.
 * Implementations typically deal in JSON or DB rows; signatures use wide entity types on purpose.
 * Parse and narrow with `parseStoredGame` (e.g. via `getGame`) before driving rules.
 */
export interface GameStorage {
  getGame(gameId: string): Promise<PortResponse<Game> | undefined>;
  saveNewGame(game: Game): Promise<PortResponse<void>>;
  /**
   * `gameState` is intentionally wide (`GameStateForBoard`). A full {@link GameForMode} discriminates `gameState`
   * by `gameType`, so merging into an existing `Game` usually needs a single assertion
   * (e.g. `{ ...game, gameState } as Game`) or a re-parse through `parseStoredGame` / per-variant
   * game schemas—same as any JSON round-trip.
   */
  updateGameState: (gameId: string, gameState: GameState) => Promise<PortResponse<void>>;
}
