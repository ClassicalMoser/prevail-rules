import type { CompleteAttackApplyEvent } from '@events';
import {
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteAttackApplyEvent, closing an attack's apply once every
 * result it reached has been carried out. The event carries nothing: which
 * apply closes is the state's to name (`getAttackApplyToClose`).
 *
 * @returns A complete CompleteAttackApplyEvent
 */
export function generateCompleteAttackApplyEvent(): CompleteAttackApplyEvent {
  // Every result the attack reached has been carried out by now, retreat,
  // then reverse, then rout (§7.5.2). Which apply closes is a shot's one or
  // the next of a melee's two in the order the blows land (§7.5.6), so
  // nothing is recorded.
  const event: CompleteAttackApplyEvent = {
    effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The close, for the transform to mark that apply done; the expected engine
  // then moves on to the melee's other apply, or ends the shot or the melee.
  return event;
}
