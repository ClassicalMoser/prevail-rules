import type { CompleteRangedAttackCommandEvent } from '@events';
import {
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteRangedAttackCommandEvent: a Shoot order ends because no
 * shooter can be chosen (§4.3.11 step 1). The player's remaining orders are
 * finished and the resolve step advances. A finished shot is
 * `completeRangedAttack`'s.
 *
 * @returns A complete CompleteRangedAttackCommandEvent
 */
export function generateCompleteRangedAttackCommandEvent(): CompleteRangedAttackCommandEvent {
  return {
    effectType: COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
