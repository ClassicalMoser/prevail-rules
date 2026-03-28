import type {
  BoardForGameType,
  GameState,
  GameType,
  ValidationResult,
} from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type {
  EventStreamStorage,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
  RoundSnapshotStorage,
} from '../ports';
import { validatePlayerChoice } from '@validation';
import { getGameState, getNextEventNumber } from '../composable';
import { processEvent } from './processEvent';

export async function processPlayerChoice<T extends GameType>(
  gameId: string,
  gameType: T,
  playerChoice: PlayerChoiceEvent<BoardForGameType[T], PlayerChoiceType>,
  gameStorage: GameStorage,
  roundSnapshotStorage: RoundSnapshotStorage,
  eventStreamStorage: EventStreamStorage,
  gameStateSubscribers: GameStateSubscriber[],
): Promise<PortResponse<GameState<BoardForGameType[T]>>> {
  // Get the game state
  const gameState: GameState<BoardForGameType[T]> | undefined =
    await getGameState(gameId, gameType, gameStorage);
  if (!gameState) {
    return {
      result: false,
      errorReason: 'Game state not initialized',
    };
  }

  // Validate the player choice
  const validation: ValidationResult = validatePlayerChoice(
    playerChoice,
    gameState,
  );
  if (!validation.result) {
    return {
      result: false,
      errorReason: validation.errorReason,
    };
  }

  // Get the next event number
  const nextEventNumber: PortResponse<number> = await getNextEventNumber(
    gameId,
    gameState.currentRoundNumber,
    eventStreamStorage,
  );
  if (!nextEventNumber.result) {
    return {
      result: false,
      errorReason: nextEventNumber.errorReason,
    };
  }

  // Check if the event number matches
  const eventNumbersMatch: boolean =
    nextEventNumber.data === playerChoice.eventNumber;
  if (!eventNumbersMatch) {
    return {
      result: false,
      errorReason: 'Event number mismatch',
    };
  }

  return processEvent(
    gameId,
    gameType,
    playerChoice,
    gameStorage,
    roundSnapshotStorage,
    eventStreamStorage,
    gameStateSubscribers,
  );
}
