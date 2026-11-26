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
 * @returns A complete CompleteMeleeResolutionEvent
 */
export function generateCompleteMeleeResolutionEvent(): CompleteMeleeResolutionEvent {
  // One engagement has been fought and both units' results carried out
  // (§7.5.6). Whether the two still stand locked, to fight again next round
  // (§7.2.3), is on the board, so the event records nothing; the first player
  // then names the next engagement, if any is left (§4.4.2).
  // It reads no state. The expected engine asks for it once both applies
  // are closed, and a procedure does not check the state it is given.
  const event: CompleteMeleeResolutionEvent = {
    effectType: COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The end of this melee, for the transform to clear it from the phase.
  return event;
}
