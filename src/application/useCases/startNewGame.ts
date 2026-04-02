import type { Army, GameType } from '@entities';
import type { BoardForGameType, Game, GameStateWithBoard } from '@game';
import type { EnginePorts, GameStateChange, PortResponse } from '../ports';
import { createEmptyGameState } from '@transforms';

const placeholderId = '00000000-0000-0000-0000-000000000000';

function placeholderArmy(): Army {
  return {
    id: placeholderId,
    units: new Set(),
    tempCommandCards: new Set(),
  };
}

export const startNewGame = async <T extends GameType>(
  gameType: T,
  ports: EnginePorts,
): Promise<PortResponse<void>> => {
  let gameState: GameStateWithBoard<BoardForGameType<T>>;
  switch (gameType as T) {
    case 'standard':
      gameState = createEmptyGameState('standard') as GameStateWithBoard<
        BoardForGameType<T>
      >;
      break;
    case 'mini':
      gameState = createEmptyGameState('mini') as GameStateWithBoard<
        BoardForGameType<T>
      >;
      break;
    case 'tutorial':
      gameState = createEmptyGameState('tutorial') as GameStateWithBoard<
        BoardForGameType<T>
      >;
      break;
    default:
      throw new Error(`Unknown gameType: ${gameType}`);
  }

  let game: Game;
  switch (gameType as T) {
    case 'standard':
      game = {
        id: placeholderId,
        gameType: 'standard',
        blackPlayer: placeholderId,
        whitePlayer: placeholderId,
        blackArmy: placeholderArmy(),
        whiteArmy: placeholderArmy(),
        gameState: gameState as GameStateWithBoard<
          BoardForGameType<'standard'>
        >,
      };
      break;
    case 'mini':
      game = {
        id: placeholderId,
        gameType: 'mini',
        blackPlayer: placeholderId,
        whitePlayer: placeholderId,
        blackArmy: placeholderArmy(),
        whiteArmy: placeholderArmy(),
        gameState: gameState as GameStateWithBoard<BoardForGameType<'mini'>>,
      };
      break;
    case 'tutorial':
      game = {
        id: placeholderId,
        gameType: 'tutorial',
        blackPlayer: placeholderId,
        whitePlayer: placeholderId,
        blackArmy: placeholderArmy(),
        whiteArmy: placeholderArmy(),
        gameState: gameState as GameStateWithBoard<
          BoardForGameType<'tutorial'>
        >,
      };
      break;
    default:
      throw new Error(`Unknown gameType: ${gameType}`);
  }

  const saveResult: PortResponse<void> =
    await ports.gameStorage.saveNewGame(game);

  if (!saveResult.result) {
    return {
      result: false,
      errorReason: saveResult.errorReason,
    };
  }

  const change: GameStateChange = {
    gameId: game.id,
    gameType: game.gameType,
    gameState: game.gameState,
  };
  for (const subscriber of ports.gameStateSubscribers) {
    if (
      subscriber.gameId !== game.id ||
      subscriber.gameType !== game.gameType
    ) {
      continue;
    }
    try {
      subscriber.onGameStateChange(change);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      subscriber.onError(err);
      return {
        result: false,
        errorReason: err.message,
      };
    }
  }
  return {
    result: true,
    data: undefined,
  };
};
