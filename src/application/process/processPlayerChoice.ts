import type { GameModeName } from '@entities';
import type { ValidationResult } from '@utils';
import type { PlayerChoiceEvent } from '@events';
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
  const loaded = await getGameState(gameId, gameMode, ports.gameStorage);
  if (!loaded.result) {
    return loaded;
  }
  const gameState = loaded.data;

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
