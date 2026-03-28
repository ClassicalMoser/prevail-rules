import type { Board, Game, GameState, GameType } from '@entities';
import type { PortResponse } from './portResponse';

/**
 * The port for reading and updating games.
 * Async functions are provided for each operation,
 * but due to frequent invocation, response times shou
 * how to handle persistent storage.
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
