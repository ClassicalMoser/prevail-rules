import type {
  BoardForGameType,
  GameState,
  GameType,
  ValidationResult,
} from '@entities';
import type { PlayerChoiceEvent, PlayerChoiceType } from '@events';
import type { EnginePorts, PortResponse } from '../ports';
import { validatePlayerChoice } from '@validation';
import { getGameState, getNextEventNumber } from '../composable';
import { processEvent } from './processEvent';

export async function processPlayerChoice<T extends GameType>(
  gameId: string,
  gameType: T,
  playerChoice: PlayerChoiceEvent<BoardForGameType[T], PlayerChoiceType>,
  ports: EnginePorts,
): Promise<PortResponse<GameState<BoardForGameType[T]>>> {
  const gameState: GameState<BoardForGameType[T]> | undefined =
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

  const nextEventNumber: PortResponse<number> = await getNextEventNumber(
    gameId,
    gameState.currentRoundNumber,
    ports.eventStreamStorage,
  );
  if (!nextEventNumber.result) {
    return {
      result: false,
      errorReason: nextEventNumber.errorReason,
    };
  }

  if (nextEventNumber.data !== playerChoice.eventNumber) {
    return {
      result: false,
      errorReason: 'Event number mismatch',
    };
  }

  return processEvent(gameId, gameType, playerChoice, gameState, ports);
}
