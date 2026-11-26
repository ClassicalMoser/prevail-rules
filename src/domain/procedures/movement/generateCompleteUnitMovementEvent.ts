import type { CompleteUnitMovementEvent } from '@events';
import {
  COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteUnitMovementEvent to complete a unit movement.
 * This marks that a unit's movement command has been fully resolved.
 *
 * @returns A complete CompleteUnitMovementEvent
 */
export function generateCompleteUnitMovementEvent(): CompleteUnitMovementEvent {
  // One unit's move is finished before the next unit begins (§4.3.9): it
  // ended on open ground, or the engagement it walked into is set up (§6).
  // Either way the unit already stands where its move ends, which the board
  // holds, so the event records nothing.
  // It reads no state. The expected engine asks for it once the move is
  // written and any engagement set up, and a procedure does not check the
  // state it is given.
  const event: CompleteUnitMovementEvent = {
    effectType: COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The unit's move is done, for the transform to clear it from the order.
  return event;
}
