import type { GameModeName, ValidationResult } from '@entities';
import type { PlayerChoiceEvent } from '@events';
import type { GameState } from '@game';
import type { EnginePorts, PortResponse } from '../ports';
import { getExpectedEvent } from '@queries';
import { validatePlayerChoice } from '@validation';
import { getGameState } from '../composable';
import { processEvent } from './processEvent';

export async function processPlayerChoice(
  gameId: string,
  gameMode: GameModeName,
  playerChoice: PlayerChoiceEvent,
  ports: EnginePorts,
): Promise<PortResponse<GameState>> {
  const gameState: GameState | undefined = await getGameState(
    gameId,
    gameMode,
    ports.gameStorage,
  );
  if (!gameState) {
    return {
      errorReason: 'Game state not initialized',
      result: false,
    };
  }

  const validation: ValidationResult = validatePlayerChoice(
    playerChoice,
    gameState,
  );
  if (!validation.result) {
    return {
      errorReason: validation.errorReason,
      result: false,
    };
  }

  const expected = getExpectedEvent(gameState);
  if (expected.expectedEventNumber !== playerChoice.eventNumber) {
    return {
      errorReason: 'Event number mismatch',
      result: false,
    };
  }

  return processEvent(gameId, gameMode, playerChoice, gameState, ports);
}
