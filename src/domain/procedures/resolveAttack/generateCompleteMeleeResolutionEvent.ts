import type { CompleteMeleeResolutionEvent } from '@events';
import {
  COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteMeleeResolutionEvent to complete a melee resolution.
 * This clears the currentMeleeResolutionState and allows the phase to continue
 * to the next engagement or complete.
 *
 * @param eventNumber - The position this event takes in the round's event stream
 * @returns A complete CompleteMeleeResolutionEvent
 */
export function generateCompleteMeleeResolutionEvent(
  eventNumber: number,
): CompleteMeleeResolutionEvent {
  return {
    effectType: COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
