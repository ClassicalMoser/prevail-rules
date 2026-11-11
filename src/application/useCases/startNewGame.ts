import type { GameModeName } from '@entities';
import type { Game } from '@game';
import type {
  EnginePorts,
  GameStateChange,
  NewGame,
  PortResponse,
} from '@application/ports';
import { createInitialGameState } from '@factories';
import { parseLegalGameForMode } from '../utils/parseLegalGame';

/**
 * Starts a game in `gameMode` for the players and armies given: the mode's
 * board, empty; each army's units in reserve and its command cards in hand; and
 * round 0, setup, waiting for the side with the initiative to deploy (§3.5).
 * The game must be a legal one — armies that keep the army rules and the
 * mode's limits — and is refused with the reason if it is not, before anything
 * is saved. Once saved, round 0's event stream is opened, so setup is recorded
 * as every round is.
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
  // The mode catalog says which board it is played on; the game is then
  // checked against the same catalog by `parseLegalGameForMode`. Both armies
  // start in reserve, to be placed in round 0.
  const gameState = createInitialGameState({
    blackArmy: newGame.blackArmy,
    gameMode,
    whiteArmy: newGame.whiteArmy,
  });

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

  // Setup is round 0, and its events are recorded in its own stream.
  const streamResult = await ports.eventStreamStorage.newEventStream(
    game.id,
    game.gameState.currentRoundState.roundNumber,
  );
  if (!streamResult.result) {
    return {
      errorReason: streamResult.errorReason,
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
