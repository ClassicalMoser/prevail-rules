import type { Board, GameState } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import {
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import { getOtherPlayer } from '@queries';

/**
 * Generates a CompleteMoveCommandersPhaseEvent to complete the move commanders phase
 * and advance to issue commands phase.
 * Extracts commands from the cards currently in play for both players.
 *
 * @param state - The current game state
 * @returns A complete CompleteMoveCommandersPhaseEvent with commands for both players
 */
export function generateCompleteMoveCommandersPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteMoveCommandersPhaseEvent<TBoard, 'completeMoveCommandersPhase'> {
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  const firstPlayerCard = state.cardState[firstPlayer].inPlay;
  const secondPlayerCard = state.cardState[secondPlayer].inPlay;

  if (!firstPlayerCard || !secondPlayerCard) {
    throw new Error('First or second player card not found');
  }

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
    firstPlayerCommands: new Set([firstPlayerCard.command]),
    secondPlayerCommands: new Set([secondPlayerCard.command]),
  };
}
