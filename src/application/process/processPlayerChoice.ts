import type { GameType, ValidationResult } from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type { BoardForGameType, GameStateWithBoard } from '@game';
import type { EnginePorts, PortResponse } from '../ports';
import { getExpectedEvent } from '@queries';
import { validatePlayerChoice } from '@validation';
import { getGameState } from '../composable';
import { processEvent } from './processEvent';

export async function processPlayerChoice<T extends GameType>(
  gameId: string,
  gameType: T,
  playerChoice: PlayerChoiceEvent<BoardForGameType<T>, PlayerChoiceType>,
  ports: EnginePorts,
): Promise<PortResponse<GameStateWithBoard<BoardForGameType<T>>>> {
  const gameState: GameStateWithBoard<BoardForGameType<T>> | undefined =
    await getGameState(gameId, gameType, ports.gameStorage);
  if (!gameState) {
    return {
      result: false,
      errorReason: 'Game state not initialized',
    };
  }

  const validation: ValidationResult = validatePlayerChoice(
    playerChoice,
    gameState,
  );
  if (!validation.result) {
    return {
      result: false,
      errorReason: validation.errorReason,
    };
  }

  const expected = getExpectedEvent(gameState);
  if (expected.eventNumber !== playerChoice.eventNumber) {
    return {
      result: false,
      errorReason: 'Event number mismatch',
    };
  }

  return processEvent(gameId, gameType, playerChoice, gameState, ports);
}
