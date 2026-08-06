import { gameModes } from '@entities';
import type { Army, GameModeName } from '@entities';
import type { GameForVisibility, GameState } from '@game';
import type {
  EnginePorts,
  GameStateChange,
  PortResponse,
} from '@application/ports';
import { createEmptyGameState } from '@transforms';

const placeholderId = '00000000-0000-0000-0000-000000000000';

function placeholderArmy(): Army {
  return {
    id: placeholderId,
    units: [],
    commandCards: [],
  };
}

export const startNewGame = async (
  gameMode: GameModeName,
  ports: EnginePorts,
): Promise<PortResponse<void>> => {
  let gameState: GameState;
  switch (gameMode) {
    case 'tutorial': {
      gameState = createEmptyGameState('tutorial');
      break;
    }
    case 'mini': {
      gameState = createEmptyGameState('mini');
      break;
    }
    case 'standard': {
      gameState = createEmptyGameState('standard');
      break;
    }
    case 'epic': {
      gameState = createEmptyGameState('epic');
      break;
    }
    default: {
      const _exhaustive: never = gameMode;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }

  const boardSize = gameModes.find(
    (gameModeObject) => gameModeObject.name === gameMode,
  )?.boardSize;

  if (boardSize === undefined) {
    throw new Error(`Game mode ${gameMode} missing board size definition!`);
  }

  if (gameState.boardState.boardType !== boardSize) {
    throw new Error(
      `Empty game state board size ${gameState.boardState.boardType} does not match mode ${gameMode} (${boardSize}).`,
    );
  }

  const game: GameForVisibility<'authoritative'> = {
    blackArmy: placeholderArmy(),
    blackPlayer: placeholderId,
    gameMode,
    gameState: gameState as GameForVisibility<'authoritative'>['gameState'],
    id: placeholderId,
    whiteArmy: placeholderArmy(),
    whitePlayer: placeholderId,
  };

  const saveResult: PortResponse<void> =
    await ports.gameStorage.saveNewGame(game);

  if (!saveResult.result) {
    return {
      errorReason: saveResult.errorReason,
      result: false,
    };
  }

  const change: GameStateChange = {
    gameId: game.id,
    gameMode,
    gameState: game.gameState,
  };
  for (const subscriber of ports.gameStateSubscribers) {
    if (
      subscriber.gameId !== change.gameId ||
      subscriber.gameMode !== change.gameMode
    ) {
      continue;
    }
    try {
      subscriber.onGameStateChange(change);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      subscriber.onError(err);
      return {
        errorReason: err.message,
        result: false,
      };
    }
  }
  return {
    data: undefined,
    result: true,
  };
};
