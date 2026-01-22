import type { Board, GameState } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import {
  COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteAttackApplyEvent to complete an attack apply substep.
 * This marks that all attack results (rout/retreat/reverse) have been resolved.
 *
 * @param state - The current game state
 * @returns A complete CompleteAttackApplyEvent
 */
export function generateCompleteAttackApplyEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteAttackApplyEvent<TBoard, 'completeAttackApply'> {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_ATTACK_APPLY_EFFECT_TYPE,
  };
}
