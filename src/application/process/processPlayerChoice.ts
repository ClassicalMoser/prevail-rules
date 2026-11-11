import type { GameModeName } from '@entities';
import type { ValidationResult } from '@utils';
import type { PlayerChoiceEvent } from '@events';
import { isAuthoritativeGameState } from '@queries';
import type { GameStateForVisibility } from '@game';
import type { EnginePorts, PortResponse } from '@application/ports';
import { validatePlayerChoice } from '@validation';
import { getGameState } from '@application/composable';
import { processEvent } from './processEvent';

export async function processPlayerChoice(
  gameId: string,
  gameMode: GameModeName,
  playerChoice: PlayerChoiceEvent,
  ports: EnginePorts,
): Promise<PortResponse<GameStateForVisibility<'authoritative'>>> {
  const gameState = await getGameState(gameId, gameMode, ports.gameStorage);
  if (!gameState) {
    return {
      errorReason: 'Game state not initialized',
      result: false,
    };
  }

  if (!isAuthoritativeGameState(gameState)) {
    return {
      errorReason: 'Engine requires authoritative game state',
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

  return processEvent(gameId, gameMode, playerChoice, gameState, ports);
}
