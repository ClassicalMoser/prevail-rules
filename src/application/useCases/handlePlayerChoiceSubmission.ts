import type { BoardForGameType, GameType } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type {
  EventStreamStorage,
  GameStateSubscriber,
  GameStorage,
  PortResponse,
  RoundSnapshotStorage,
} from '../ports';
import { advanceEffects, processPlayerChoice } from '../process';

export async function handlePlayerChoiceSubmission<T extends GameType>(
  gameId: string,
  gameType: T,
  playerChoice: PlayerChoiceEvent<BoardForGameType[T], PlayerChoiceType>,
  gameStorage: GameStorage,
  roundSnapshotStorage: RoundSnapshotStorage,
  eventStreamStorage: EventStreamStorage,
  gameStateSubscribers: GameStateSubscriber[],
): Promise<PortResponse<void>> {
  const processResult = await processPlayerChoice(
    gameId,
    gameType,
    playerChoice,
    gameStorage,
    roundSnapshotStorage,
    eventStreamStorage,
    gameStateSubscribers,
  );
  if (!processResult.result) {
    return {
      result: false,
      errorReason: processResult.errorReason,
    };
  }
  const currentGameState = processResult.data;
  const advanceResult = await advanceEffects(
    gameId,
    gameType,
    currentGameState,
    gameStorage,
    roundSnapshotStorage,
    eventStreamStorage,
    gameStateSubscribers,
  );
  if (!advanceResult.result) {
    return advanceResult;
  }
  return {
    result: true,
    data: undefined,
  };
}
