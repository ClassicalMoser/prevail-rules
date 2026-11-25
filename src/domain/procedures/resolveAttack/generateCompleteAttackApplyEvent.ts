import type { CompleteAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import {
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import { getAttackApplyToClose } from '@queries';

/**
 * Generates a CompleteAttackApplyEvent to complete an attack apply substep.
 * This marks that all attack results (rout/retreat/reverse) have been resolved.
 * The event carries nothing; asking for the apply to close here is the check
 * that one is waiting.
 *
 * @param state - The current game state
 * @returns A complete CompleteAttackApplyEvent
 * @throws Error outside a shot or a melee, or when no apply is left to close
 */
export function generateCompleteAttackApplyEvent(
  state: GameState,
): CompleteAttackApplyEvent {
  // An apply must be waiting to close, or the effect is not owed.
  // Every result the attack reached has been carried out by now, retreat,
  // then reverse, then rout (§7.5.2). The apply this closes is the one the
  // transform will close, since both ask `getAttackApplyToClose`; its answer
  // is not needed here, only that there is one.
  getAttackApplyToClose(state);

  // Nothing to record: which apply closes is the state's to name, a shot's
  // one or the next of a melee's two in the order the blows land (§7.5.6).
  const event: CompleteAttackApplyEvent = {
    effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The close, for the transform to mark that apply done; the expected engine
  // then moves on to the melee's other apply, or ends the shot or the melee.
  return event;
}
