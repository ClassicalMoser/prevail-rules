import type { Board, GameType } from "@entities";
import type { PlayerChoiceEvent, PlayerChoiceType } from "@events";
import type { EnginePorts, PortResponse } from "./ports";
import type { GameRunner } from "./ports/gameRunner";
import { handlePlayerChoiceSubmission as handlePlayerChoiceSubmissionFunction } from "./useCases/handlePlayerChoiceSubmission";
import { startNewGame as startNewGameFunction } from "./useCases/startNewGame";

/**
 * The root factory function to create the game runner in any context.
 * @param ports The process-level dependency context.
 * @returns The game runner instance, structured according to the GameRunner interface.
 */
export function createGameRunner<TBoard extends Board>(ports: EnginePorts): GameRunner {
  const startNewGame = (gameType: GameType): Promise<PortResponse<void>> =>
    startNewGameFunction(gameType, ports);

  const handlePlayerChoiceSubmission = (
    gameId: string,
    gameType: GameType,
    playerChoice: PlayerChoiceEvent<TBoard, PlayerChoiceType>,
  ): Promise<PortResponse<void>> =>
    handlePlayerChoiceSubmissionFunction(gameId, gameType, playerChoice, ports);

  return {
    startNewGame,
    handlePlayerChoiceSubmission,
  };
}
