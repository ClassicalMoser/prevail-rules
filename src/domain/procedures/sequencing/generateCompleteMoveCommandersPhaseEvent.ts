import type { CompleteMoveCommandersPhaseEvent } from '@events';
import {
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteMoveCommandersPhaseEvent, ending Phase 2 and beginning
 * Phase 3. Each player's orders are the command on their card in play, which
 * the state already holds, so the event carries nothing.
 *
 * @returns A complete CompleteMoveCommandersPhaseEvent
 */
export function generateCompleteMoveCommandersPhaseEvent(): CompleteMoveCommandersPhaseEvent {
  // Both players have moved their commanders, or had a fallen one's turn
  // passed over (§4.2.1, §4.2.8). Orders come next (§4.3). What each player
  // may order is the command on their card in play (§4.3.1), which the state
  // holds, so nothing is recorded.
  const event: CompleteMoveCommandersPhaseEvent = {
    effectType: COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // Phase 2 ends, for the transform to open Issue Commands.
  return event;
}
