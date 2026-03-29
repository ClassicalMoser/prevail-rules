import type { GameType } from '@entities';
import type { BoardForGameType, Game, GameState } from '@game';
import type { EnginePorts, GameStateChange, PortResponse } from '../ports';
import { createEmptyGameState } from '@transforms';

export const startNewGame = async <T extends GameType>(
  gameType: T,
  ports: EnginePorts,
): Promise<PortResponse<void>> => {
  let gameState: GameState<BoardForGameType[T]>;
  switch (gameType) {
    case 'standard':
      gameState = createEmptyGameState({
        boardSize: 'standard',
      }) as GameState<BoardForGameType[T]>;
      break;
    case 'mini':
      gameState = createEmptyGameState({
        boardSize: 'small',
      }) as GameState<BoardForGameType[T]>;
      break;
    case 'tutorial':
      gameState = createEmptyGameState({
        boardSize: 'small',
      }) as GameState<BoardForGameType[T]>;
      break;
    default: {
      const _exhaustive: never = gameType;
      return {
        result: false,
        errorReason: `Unknown gameType: ${_exhaustive}`,
      };
    }
  }

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
    gameState: game.gameState as GameState<BoardForGameType[GameType]>,
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
