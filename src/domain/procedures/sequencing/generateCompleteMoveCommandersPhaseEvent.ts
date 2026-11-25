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
  // Both players have moved their commanders, or had a fallen one's turn
  // passed over (§4.2.1, §4.2.8); asked in any other phase, the getter throws.
  getMoveCommandersPhaseState(state);

  // Orders come next (§4.3). What each player may order is the command on
  // their card in play (§4.3.1), which the state holds, so nothing is
  // recorded.
  const event: CompleteMoveCommandersPhaseEvent = {
    effectType: COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // Phase 2 ends, for the transform to open Issue Commands.
  return event;
}
