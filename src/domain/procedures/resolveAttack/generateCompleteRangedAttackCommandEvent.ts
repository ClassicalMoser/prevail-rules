import type { CompleteRangedAttackCommandEvent } from '@events';
import {
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteRangedAttackCommandEvent to complete a ranged attack command.
 * This clears the ranged attack resolution state and allows the command resolution
 * to advance to the next command.
 *
 * @returns A complete CompleteRangedAttackCommandEvent
 */
export function generateCompleteRangedAttackCommandEvent(): CompleteRangedAttackCommandEvent {
  return {
    effectType: COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
