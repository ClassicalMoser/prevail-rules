import type { CompleteMoveCommandersPhaseEvent } from '@events';
import type { GameState } from '@game';
import {
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import { getMoveCommandersPhaseState } from '@queries';

/**
 * Generates a CompleteMoveCommandersPhaseEvent, ending Phase 2 and beginning
 * Phase 3. Each player's orders are the command on their card in play, which
 * the state already holds, so the event carries nothing.
 *
 * @param state - The current game state, in Move Commanders
 * @returns A complete CompleteMoveCommandersPhaseEvent
 * @throws Error outside the Move Commanders phase
 */
export function generateCompleteMoveCommandersPhaseEvent(
  state: GameState,
): CompleteMoveCommandersPhaseEvent {
  // Only Move Commanders can be ended here.
  getMoveCommandersPhaseState(state);

  const event: CompleteMoveCommandersPhaseEvent = {
    effectType: COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
