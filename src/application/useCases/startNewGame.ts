import { gameModes } from "@entities";
import type { Army, GameMode, GameModeName } from "@entities";
import type { Game, GameForMode, GameState } from "@game";
import type { EnginePorts, GameStateChange, PortResponse } from "../ports";
import { createEmptyGameState } from "@transforms";

const placeholderId = "00000000-0000-0000-0000-000000000000";

function placeholderArmy(): Army {
  return {
    id: placeholderId,
    units: new Set(),
    tempCommandCards: new Set(),
  };
}

export const startNewGame = async (
  gameMode: GameModeName,
  ports: EnginePorts,
): Promise<PortResponse<void>> => {
  let gameState: GameState;
  switch (gameMode) {
    case "tutorial":
      gameState = createEmptyGameState("tutorial");
      break;
    case "mini":
      gameState = createEmptyGameState("mini");
      break;
    case "standard":
      gameState = createEmptyGameState("standard");
      break;
    case "epic":
      gameState = createEmptyGameState("epic");
      break;
    default: {
      const _exhaustive: never = gameMode;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }

  const boardSize = gameModes.find((gameModeObject) => gameModeObject.name === gameMode)?.boardSize;

  if (boardSize === undefined) {
    throw new Error(`Game mode ${gameMode} missing board size definition!`);
  }

  let game: GameForMode<GameMode>;
  switch (gameMode) {
    case "tutorial":
      game = {
        id: placeholderId,
        gameType: "tutorial",
        boardType: boardSize,
        blackPlayer: placeholderId,
        whitePlayer: placeholderId,
        blackArmy: placeholderArmy(),
        whiteArmy: placeholderArmy(),
        gameState,
      };
      break;
    case "mini":
      game = {
        id: placeholderId,
        gameType: "mini",
        boardType: boardSize,
        blackPlayer: placeholderId,
        whitePlayer: placeholderId,
        blackArmy: placeholderArmy(),
        whiteArmy: placeholderArmy(),
        gameState,
      };
      break;
    case "standard":
      game = {
        id: placeholderId,
        gameType: "standard",
        boardType: boardSize,
        blackPlayer: placeholderId,
        whitePlayer: placeholderId,
        blackArmy: placeholderArmy(),
        whiteArmy: placeholderArmy(),
        gameState,
      };
      break;
    case "epic":
      game = {
        id: placeholderId,
        gameType: "epic",
        boardType: boardSize,
        blackPlayer: placeholderId,
        whitePlayer: placeholderId,
        blackArmy: placeholderArmy(),
        whiteArmy: placeholderArmy(),
        gameState,
      };
      break;
    default: {
      const _exhaustive: never = gameMode;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }

  // We narrow first to ensure type match at creation time.
  // Then we broaden to save for facility in the runner.
  const broadenedGame = game as Game;

  const saveResult: PortResponse<void> = await ports.gameStorage.saveNewGame(broadenedGame);

  if (!saveResult.result) {
    return {
      result: false,
      errorReason: saveResult.errorReason,
    };
  }

  const change: GameStateChange = {
    gameId: game.id,
    gameType: game.gameType,
    gameState: broadenedGame.gameState,
  };
  for (const subscriber of ports.gameStateSubscribers) {
    if (
      subscriber.gameId !== change.gameId ||
      subscriber.gameMode.name !== change.gameType
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
