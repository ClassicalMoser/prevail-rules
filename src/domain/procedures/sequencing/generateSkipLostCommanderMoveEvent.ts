import type { SkipLostCommanderMoveEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE,
} from '@events';

/**
 * Generates a SkipLostCommanderMoveEvent on the Move Commanders turn of a
 * player whose commander has fallen (§4.2.8). The event carries nothing: whose
 * turn it is, and that their commander is lost, are the state's.
 *
 * @returns A complete SkipLostCommanderMoveEvent
 */
export function generateSkipLostCommanderMoveEvent(): SkipLostCommanderMoveEvent {
  // Only a commander defeated with its own unit's rout is lost (§4.2.8). Its
  // player has nothing to move, so the turn passes. Whose turn it was is the
  // step's to say, so nothing is recorded.
  const event: SkipLostCommanderMoveEvent = {
    effectType: SKIP_LOST_COMMANDER_MOVE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The turn passed over, for the transform to move to the next step.
  return event;
}
