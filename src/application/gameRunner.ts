import type { GameModeName } from "@entities";
import type { PlayerChoiceEvent } from "@events";
import type { EnginePorts, PortResponse } from "./ports";
import type { GameRunner } from "./ports/gameRunner";
import { handlePlayerChoiceSubmission as handlePlayerChoiceSubmissionFunction } from "./useCases/handlePlayerChoiceSubmission";
import { startNewGame as startNewGameFunction } from "./useCases/startNewGame";

/**
 * The root factory function to create the game runner in any context.
 * @param ports The process-level dependency context.
 * @returns The game runner instance, structured according to the GameRunner interface.
 */
export function createGameRunner(ports: EnginePorts): GameRunner {
  const startNewGame = (gameMode: GameModeName): Promise<PortResponse<void>> =>
    startNewGameFunction(gameMode, ports);

  const handlePlayerChoiceSubmission = (
    gameId: string,
    playerChoice: PlayerChoiceEvent,
  ): Promise<PortResponse<void>> =>
    handlePlayerChoiceSubmissionFunction(gameId, playerChoice, ports);

  return {
    startNewGame,
    handlePlayerChoiceSubmission,
  };
}
