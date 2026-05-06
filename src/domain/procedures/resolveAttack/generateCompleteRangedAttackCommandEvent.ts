import {
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  CompleteRangedAttackCommandEvent,
  GAME_EFFECT_EVENT_TYPE,
} from "@events";

/**
 * Generates a CompleteRangedAttackCommandEvent to complete a ranged attack command.
 * This clears the ranged attack resolution state and allows the command resolution
 * to advance to the next command.
 *
 * @param state - The current game state
 * @returns A complete CompleteRangedAttackCommandEvent
 */
export function generateCompleteRangedAttackCommandEvent(
  eventNumber: number,
): CompleteRangedAttackCommandEvent {
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
    eventNumber,
  };
}
