import type { GameModeName, PlayerSide } from '@entities';
import type { PlayerChoiceEvent } from '@events';
import type { Game } from '@game';
import type { EnginePorts, PortResponse } from './ports';
import type { GameRunner } from './ports/gameRunner';
import { handlePlayerChoiceSubmission as handlePlayerChoiceSubmissionFunction } from './useCases/handlePlayerChoiceSubmission';
import { requestGameStateSnapshot as requestGameStateSnapshotFunction } from './useCases/requestGameStateSnapshot';
import { startNewGame as startNewGameFunction } from './useCases/startNewGame';

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
    gameMode: GameModeName,
    playerChoice: PlayerChoiceEvent,
  ): Promise<PortResponse<void>> =>
    handlePlayerChoiceSubmissionFunction(gameId, gameMode, playerChoice, ports);

  const requestGameStateSnapshot = (
    gameId: string,
    gameMode: GameModeName,
    playerSide: PlayerSide,
  ): Promise<PortResponse<Game>> =>
    requestGameStateSnapshotFunction(gameId, gameMode, playerSide, ports);

  return {
    handlePlayerChoiceSubmission,
    requestGameStateSnapshot,
    startNewGame,
  };
}
