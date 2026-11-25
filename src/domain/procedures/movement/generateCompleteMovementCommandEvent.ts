import type { CompleteMovementCommandEvent } from '@events';
import {
  COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteMovementCommandEvent when no remaining unit can legally
 * start a movement resolution (mirrors completeRangedAttackCommand).
 *
 * @returns A complete CompleteMovementCommandEvent
 */
export function generateCompleteMovementCommandEvent(): CompleteMovementCommandEvent {
  // Every unit of the Move order has moved, or none left can: a unit locked
  // in a fight cannot move (§6.1.2), and the order may leave units unmoved
  // (§4.3.2). The expected engine decided that from the board; the units
  // left over are the ones still listed in the phase, so the event records
  // nothing.
  // TODO(composition): this reads no state, so it cannot refuse while a unit
  // of the order could still move; only the expected engine's gate stands
  // before it. `generateCompleteRangedAttackCommandEvent` is the same.
  // Settle by asking `getLegalMoveUnits` here and refusing while it lists
  // anyone, or by stating that a state-free close is intended.
  const event: CompleteMovementCommandEvent = {
    effectType: COMPLETE_MOVEMENT_COMMAND_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The end of the order, for the transform to finish this player's orders.
  return event;
}
