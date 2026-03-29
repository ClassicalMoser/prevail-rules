import type { GameType } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type { BoardForGameType } from '@game';
import type { EnginePorts, PortResponse } from '../ports';
import { advanceEffects, processPlayerChoice } from '../process';

export async function handlePlayerChoiceSubmission<T extends GameType>(
  gameId: string,
  gameType: T,
  playerChoice: PlayerChoiceEvent<BoardForGameType[T], PlayerChoiceType>,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  const processResult = await processPlayerChoice(
    gameId,
    gameType,
    playerChoice,
    ports,
  );
  if (!processResult.result) {
    return {
      result: false,
      errorReason: processResult.errorReason,
    };
  }
  const advanceResult = await advanceEffects(
    gameId,
    gameType,
    processResult.data,
    ports,
  );
  if (!advanceResult.result) {
    return advanceResult;
  }
  return {
    result: true,
    data: undefined,
  };
}
