import type { PlayerChoiceEvent } from "@events";
import type { EnginePorts, PortResponse } from "../ports";
import { advanceEffects, processPlayerChoice } from "../process";

export async function handlePlayerChoiceSubmission(
  gameId: string,
  playerChoice: PlayerChoiceEvent,
  ports: EnginePorts,
): Promise<PortResponse<void>> {
  const processResult = await processPlayerChoice(gameId, playerChoice, ports);
  if (!processResult.result) {
    return {
      result: false,
      errorReason: processResult.errorReason,
    };
  }
  const advanceResult = await advanceEffects(gameId, processResult.data, ports);
  if (!advanceResult.result) {
    return advanceResult;
  }
  return {
    result: true,
    data: undefined,
  };
}
