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
  // TODO(composition): this reads no state, so it cannot refuse while the
  // move is unwritten or its engagement still open; only the expected
  // engine's gate stands before it, and `applyCompleteUnitMovementEvent`
  // checks the mover stands where its move ends. Settle by asking
  // `getMovementResolutionState` here, or by stating that a state-free close
  // is intended.
  const event: CompleteUnitMovementEvent = {
    effectType: COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The unit's move is done, for the transform to clear it from the order.
  return event;
}
