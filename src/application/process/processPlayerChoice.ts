import type { GameModeName } from '@ruleValues';
import type { ValidationResult } from '@utils';
import type { PlayerChoiceEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import type { EnginePorts, RunnerResponse } from '@application/ports';
import { validatePlayerChoice } from '@validation';
import { getGameState } from '@application/composable';
import { processEvent } from './processEvent';

export async function processPlayerChoice(
  gameId: string,
  gameMode: GameModeName,
  playerChoice: PlayerChoiceEvent,
  ports: EnginePorts,
): Promise<RunnerResponse<AuthoritativeGameState>> {
  const loaded = await getGameState(gameId, gameMode, ports.gameStorage);
  if (!loaded.result) {
    return loaded;
  }
  const gameState = loaded.data;

  const validation: ValidationResult = validatePlayerChoice(
    playerChoice,
    gameState,
  );
  // The rules refused the choice: not the one owed, not well formed, or not
  // legal. The validator's reason says which.
  if (!validation.result) {
    const refused: RunnerResponse<AuthoritativeGameState> = {
      errorReason: validation.errorReason,
      failure: 'choiceRefused',
      result: false,
    };
    return refused;
  }

  return processEvent(gameId, gameMode, playerChoice, gameState, ports);
}
