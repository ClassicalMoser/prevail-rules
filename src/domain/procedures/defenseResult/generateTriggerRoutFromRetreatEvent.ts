import type { TriggerRoutFromRetreatEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
} from '@events';

/**
 * Builds the effect that turns a retreat with nowhere to go into a rout
 * (§9.1.6). The event carries nothing: applying it finds the retreat waiting
 * for its rout (`getRetreatAwaitingRout`).
 *
 * @returns The event
 */
export function generateTriggerRoutFromRetreatEvent(): TriggerRoutFromRetreatEvent {
  // Nothing to measure: the retreat found no legal path when it opened.
  const event: TriggerRoutFromRetreatEvent = {
    effectType: TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The rout that takes the retreat's place, carried out at the retreat's
  // own turn rather than later with the routs (§7.5.6).
  return event;
}
