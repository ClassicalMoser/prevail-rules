import type { CompleteMeleeResolutionEvent } from "@events";
import { COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from "@events";

/**
 * Generates a CompleteMeleeResolutionEvent to complete a melee resolution.
 * This clears the currentMeleeResolutionState and allows the phase to continue
 * to the next engagement or complete.
 *
 * @param state - The current game state
 * @returns A complete CompleteMeleeResolutionEvent
 */
export function generateCompleteMeleeResolutionEvent(
  eventNumber: number,
): CompleteMeleeResolutionEvent {
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
    eventNumber,
  };
}
