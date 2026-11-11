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
  getAttackApplyToClose(state);

  const event: CompleteAttackApplyEvent = {
    effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
