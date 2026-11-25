import type { CompleteRangedAttackEvent } from '@events';
import {
  COMPLETE_RANGED_ATTACK_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteRangedAttackEvent: one shot of a Shoot order is done
 * (§4.3.11), so the next shooter may be chosen.
 *
 * @returns A complete CompleteRangedAttackEvent
 */
export function generateCompleteRangedAttackEvent(): CompleteRangedAttackEvent {
  // The shot's results are carried out and its apply is closed. Which units
  // of the order may still shoot is asked when the next shooter is chosen,
  // so the event records nothing.
  const event: CompleteRangedAttackEvent = {
    effectType: COMPLETE_RANGED_ATTACK_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The end of this shot, for the transform to clear it from the order.
  return event;
}
