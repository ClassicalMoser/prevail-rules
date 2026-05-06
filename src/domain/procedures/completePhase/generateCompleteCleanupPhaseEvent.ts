import type { CompleteCleanupPhaseEvent } from "@events";
import type { GameState } from "@game";
import { COMPLETE_CLEANUP_PHASE_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from "@events";

/**
 * Generates a CompleteCleanupPhaseEvent to complete the cleanup phase,
 * advance round, and reset to play cards phase.
 *
 * @param state - The current game state
 * @returns A complete CompleteCleanupPhaseEvent
 */
export function generateCompleteCleanupPhaseEvent(
  state: GameState,
  eventNumber: number,
): CompleteCleanupPhaseEvent {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_CLEANUP_PHASE_EFFECT_TYPE,
    eventNumber,
  };
}
