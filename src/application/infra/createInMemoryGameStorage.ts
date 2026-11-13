import type { Game } from '@game';
import type { GameStorage, PortResponse } from '@application/ports';

/**
 * A `GameStorage` that keeps games in memory, by id, for as long as it lives.
 * For specs and for running games where nothing needs to outlast the process.
 *
 * @returns An empty game storage
 */
export function createInMemoryGameStorage(): GameStorage {
  const games = new Map<string, Game>();

  const storage: GameStorage = {
    getGame: async (gameId) => {
      // An unknown id answers no game; `getGame` in the composables reports it
      // as not found.
      const found: PortResponse<unknown> = {
        data: games.get(gameId),
        result: true,
      };
      return found;
    },

    saveNewGame: async (game) => {
      // A new game is stored as it was started.
      games.set(game.id, game);
      const saved: PortResponse<void> = { data: undefined, result: true };
      return saved;
    },

    updateGameState: async (gameId, gameState) => {
      const game = games.get(gameId);

      // A state can only replace the state of a game already stored.
      if (game === undefined) {
        const missing: PortResponse<void> = {
          errorReason: `Game ${gameId} not found`,
          result: false,
        };
        return missing;
      }

      // A game holds the full record, so a state seen by one seat or a
      // spectator cannot stand in for it.
      if (gameState.visibility !== 'authoritative') {
        const partial: PortResponse<void> = {
          errorReason: `Game ${gameId} stores only its full state, not a ${gameState.visibility} view`,
          result: false,
        };
        return partial;
      }

      // The game keeps its players and armies; only its state moves on.
      games.set(gameId, { ...game, gameState });
      const updated: PortResponse<void> = { data: undefined, result: true };
      return updated;
    },
  };

  // The three operations share the one map.
  return storage;
}
