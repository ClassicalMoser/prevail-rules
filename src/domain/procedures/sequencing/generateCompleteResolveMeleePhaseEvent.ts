import type { CompleteResolveMeleePhaseEvent } from '@events';
import {
  COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteResolveMeleePhaseEvent, ending Phase 4 and beginning
 * Cleanup. A fight neither side won is on the board, so the event carries
 * nothing.
 *
 * @returns A complete CompleteResolveMeleePhaseEvent
 */
export function generateCompleteResolveMeleePhaseEvent(): CompleteResolveMeleePhaseEvent {
  // Every engagement on the board has been fought, or there were none, and
  // the phase ends at once (§4.4.2, §4.4.4). A fight neither side won stays
  // on the board to be fought next round (§7.2.3); the board holds it, so
  // nothing is recorded. Cleanup follows (§4.5).
  const event: CompleteResolveMeleePhaseEvent = {
    effectType: COMPLETE_RESOLVE_MELEE_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // Phase 4 ends, for the transform to open Cleanup.
  return event;
}
