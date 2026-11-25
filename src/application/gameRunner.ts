import type { GameModeName } from '@ruleValues';
import type { PlayerChoiceEvent } from '@events';
import type { GameState, GameStateVisibility, ProjectedGame } from '@game';
import type { EnginePorts, RunnerResponse } from './ports';
import type { GameRunner, NewGame } from './ports/gameRunner';
import { advanceUntilPlayerChoice as advanceUntilPlayerChoiceFunction } from './useCases/advanceUntilPlayerChoice';
import { handlePlayerChoiceSubmission as handlePlayerChoiceSubmissionFunction } from './useCases/handlePlayerChoiceSubmission';
import { requestGameRecord as requestGameRecordFunction } from './useCases/requestGameRecord';
import { requestGameStateSnapshot as requestGameStateSnapshotFunction } from './useCases/requestGameStateSnapshot';
import { startNewGame as startNewGameFunction } from './useCases/startNewGame';

/**
 * The root factory function to create the game runner in any context.
 * @param ports The process-level dependency context.
 * @returns The game runner instance, structured according to the GameRunner interface.
 */
export function createGameRunner(ports: EnginePorts): GameRunner {
  const startNewGame = (
    gameMode: GameModeName,
    newGame: NewGame,
  ): Promise<RunnerResponse<void>> =>
    startNewGameFunction(gameMode, newGame, ports);

  const handlePlayerChoiceSubmission = (
    gameId: string,
    gameMode: GameModeName,
    playerChoice: PlayerChoiceEvent,
  ): Promise<RunnerResponse<void>> =>
    handlePlayerChoiceSubmissionFunction(gameId, gameMode, playerChoice, ports);

  const advanceUntilPlayerChoice = (
    gameId: string,
    gameMode: GameModeName,
  ): Promise<RunnerResponse<void>> =>
    advanceUntilPlayerChoiceFunction(gameId, gameMode, ports);

  const requestGameStateSnapshot = (
    gameId: string,
    gameMode: GameModeName,
    visibility: GameStateVisibility,
  ): Promise<RunnerResponse<GameState>> =>
    requestGameStateSnapshotFunction(gameId, gameMode, visibility, ports);

  const requestGameRecord = (
    gameId: string,
    gameMode: GameModeName,
    visibility: GameStateVisibility,
  ): Promise<RunnerResponse<ProjectedGame>> =>
    requestGameRecordFunction(gameId, gameMode, visibility, ports);

  return {
    advanceUntilPlayerChoice,
    handlePlayerChoiceSubmission,
    requestGameRecord,
    requestGameStateSnapshot,
    startNewGame,
  };
}
