import type { PlayerChoiceEvent } from '@events';
import type { EnginePorts, PortResponse } from '@application/ports';
import { advanceEffects, processPlayerChoice } from '@application/process';
import type { GameModeName } from '@entities';

export async function handlePlayerChoiceSubmission(
  gameId: string,
  gameMode: GameModeName,
  playerChoice: PlayerChoiceEvent,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  const processResult = await processPlayerChoice(
    gameId,
    gameMode,
    playerChoice,
    ports,
  );
  if (!processResult.result) {
    return {
      errorReason: processResult.errorReason,
      result: false,
    };
  }
  const advanceResult = await advanceEffects(
    gameId,
    gameMode,
    processResult.data,
    ports,
  );
  if (!advanceResult.result) {
    return advanceResult;
  }
  return {
    data: undefined,
    result: true,
  };
}
