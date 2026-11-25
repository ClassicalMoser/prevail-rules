import type { PlayerChoiceEvent } from '@events';
import type { EnginePorts, RunnerResponse } from '@application/ports';
import { advanceEffects, processPlayerChoice } from '@application/process';
import type { GameModeName } from '@ruleValues';

export async function handlePlayerChoiceSubmission(
  gameId: string,
  gameMode: GameModeName,
  playerChoice: PlayerChoiceEvent,
  ports: EnginePorts,
): Promise<RunnerResponse<void>> {
  const processResult = await processPlayerChoice(
    gameId,
    gameMode,
    playerChoice,
    ports,
  );
  if (!processResult.result) {
    return processResult;
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
