import type { Board, GameState } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import {
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteMoveCommandersPhaseEvent to complete the move commanders phase
 * and advance to issue commands phase.
 *
 * @param state - The current game state
 * @returns A complete CompleteMoveCommandersPhaseEvent
 */
export function generateCompleteMoveCommandersPhaseEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteMoveCommandersPhaseEvent<TBoard, 'completeMoveCommandersPhase'> {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  };
}
