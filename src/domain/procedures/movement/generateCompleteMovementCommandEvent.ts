import type { CompleteMovementCommandEvent } from '@events';
import {
  COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteMovementCommandEvent when no remaining unit can legally
 * start a movement resolution (mirrors completeRangedAttackCommand).
 */
export function generateCompleteMovementCommandEvent(
  eventNumber: number,
): CompleteMovementCommandEvent {
  return {
    effectType: COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
}
