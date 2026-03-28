import type { BoardForGameType, Game, GameState, GameType } from '@entities';
import type { GameStorage, PortResponse } from '../ports';
import { createEmptyGameState } from '@transforms';

export const startNewGame = async <T extends GameType>(
  gameType: T,
  gameStorage: GameStorage,
): Promise<void> => {
  const selectGameState = (gameType: T): GameState<BoardForGameType[T]> => {
    switch (gameType) {
      case 'standard':
        return createEmptyGameState({
          boardSize: 'standard',
        });
      case 'mini':
        return createEmptyGameState({
          boardSize: 'small',
        });
      case 'tutorial':
        return createEmptyGameState({
          boardSize: 'small',
        });
      default:
        throw new Error(`Unknown gameType: ${gameType}`);
    }
  };

  const gameState = selectGameState(gameType);

  // Temporary: No content yet.
  const game: Game<GameType> = {
    id: '00000000-0000-0000-0000-000000000000',
    gameType,
    blackPlayer: '00000000-0000-0000-0000-000000000000',
    whitePlayer: '00000000-0000-0000-0000-000000000000',
    blackArmy: {
      id: '00000000-0000-0000-0000-000000000000',
      units: new Set(),
      commandCards: new Set(),
    },
    whiteArmy: {
      id: '00000000-0000-0000-0000-000000000000',
      units: new Set(),
      commandCards: new Set(),
    },
    gameState,
  };
  const result: PortResponse<void> = await gameStorage.saveNewGame(game);

  if (!result?.result) {
    throw new Error(result?.errorReason ?? 'Unknown error');
  }
};
