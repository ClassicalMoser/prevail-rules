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
  return {
    effectType: COMPLETE_RANGED_ATTACK_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
