import { gameModes } from '@entities';
import type { GameModeName } from '@entities';
import type { Game, GameState } from '@game';
import type {
  EnginePorts,
  GameStateChange,
  NewGame,
  PortResponse,
} from '@application/ports';
import { createEmptyGameState } from '@factories';
import { parseLegalGameForMode } from '../utils/parseLegalGame';

/**
 * Starts a game in `gameMode`: an empty game state of the mode's board size,
 * for the players and armies given. The game must be a legal one — armies
 * that keep the army rules and the mode's limits — and is refused with the
 * reason if it is not, before anything is saved.
 *
 * @param gameMode - The mode to play
 * @param newGame - The game's id, its two players and their armies
 * @param ports - The process-level dependency context
 * @returns Success once the game is saved and its subscribers told, or the reason it was not
 */

export const startNewGame = async (
  gameMode: GameModeName,
  newGame: NewGame,
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

  const candidate: Game = { ...newGame, gameMode, gameState };
  const legal = parseLegalGameForMode(gameMode, candidate);
  if (!legal.result) {
    return legal;
  }
  const game = legal.data;

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
