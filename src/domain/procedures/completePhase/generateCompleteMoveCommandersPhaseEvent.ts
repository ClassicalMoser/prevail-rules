import type { Board } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import type { GameStateWithBoard } from '@game';
import {
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import { getOtherPlayer } from '@queries';

/**
 * Generates a CompleteMoveCommandersPhaseEvent to complete the move commanders phase
 * and advance to issue commands phase.
 *
 * Command sets are computed from each side's in-play card so replay does not re-read cards.
 *
 * @param state - The current game state
 * @returns A complete CompleteMoveCommandersPhaseEvent
 */
export function generateCompleteMoveCommandersPhaseEvent<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  eventNumber: number,
): CompleteMoveCommandersPhaseEvent<TBoard, 'completeMoveCommandersPhase'> {
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  const firstPlayerCard = state.cardState[firstPlayer].inPlay;
  const secondPlayerCard = state.cardState[secondPlayer].inPlay;

  const remainingCommandsFirstPlayer = new Set(
    firstPlayerCard != null ? [firstPlayerCard.command] : [],
  );
  const remainingCommandsSecondPlayer = new Set(
    secondPlayerCard != null ? [secondPlayerCard.command] : [],
  );

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
    eventNumber,
    remainingCommandsFirstPlayer,
    remainingCommandsSecondPlayer,
  };
}
