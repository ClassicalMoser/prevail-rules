import type { Board, GameType } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type {
  EventStreamStorage,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
  RoundSnapshotStorage,
} from './ports';
import type { GameRunner } from './ports/gameRunner';
import { handlePlayerChoiceSubmission as handlePlayerChoiceSubmissionFunction } from './useCases/handlePlayerChoiceSubmission';
import { startNewGame as startNewGameFunction } from './useCases/startNewGame';

/**
 * The root factory function to create the game runner in any context.
 * @param ports The ports to use for the game runner.
 * @param ports.gameStorage The port for reading and updating games.
 * @param ports.roundSnapshotStorage The port for storing and retrieving round snapshots.
 * @param ports.eventStreamStorage The port for storing and retrieving event streams.
 * @param ports.gameStateSubscribers The subscribers to the game state.
 * @returns The game runner instance, structured according to the GameRunner interface.
 */
export function createGameRunner(ports: {
  gameStorage: GameStorage;
  roundSnapshotStorage: RoundSnapshotStorage;
  eventStreamStorage: EventStreamStorage;
  gameStateSubscribers: GameStateSubscriber[];
}): GameRunner {
  const {
    gameStorage,
    roundSnapshotStorage,
    eventStreamStorage,
    gameStateSubscribers,
  } = ports;

  /**
   * The entry point to start a new game.
   * @param gameType The type of game to start.
   * @returns The result of the operation.
   */
  const startNewGame = (gameType: GameType): Promise<void> =>
    startNewGameFunction(gameType, gameStorage);

  /**
   * The entry point to submit a player choice.
   * @param gameId The ID of the game.
   * @param gameType The type of game.
   * @param playerChoice The player choice to submit.
   * @returns The result of the operation.
   */
  const handlePlayerChoiceSubmission = (
    gameId: string,
    gameType: GameType,
    playerChoice: PlayerChoiceEvent<Board, PlayerChoiceType>,
  ): Promise<PortResponse<void>> =>
    handlePlayerChoiceSubmissionFunction(
      gameId,
      gameType,
      playerChoice,
      gameStorage,
      roundSnapshotStorage,
      eventStreamStorage,
      gameStateSubscribers,
    );

  return {
    startNewGame,
    handlePlayerChoiceSubmission,
  };
}
