import type { CompleteUnitMovementEvent } from "@events";
import { COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from "@events";

/**
 * Generates a CompleteUnitMovementEvent to complete a unit movement.
 * This marks that a unit's movement command has been fully resolved.
 *
 * @param eventNumber - The ordered index of the event in the round, zero-indexed.
 * @returns A complete CompleteUnitMovementEvent
 */
export function generateCompleteUnitMovementEvent(eventNumber: number): CompleteUnitMovementEvent {
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
    eventNumber,
  };
}
