import type { Board, GameState } from '@entities';
import type { CompleteRangedAttackCommandEvent } from '@events';
import {
  COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteRangedAttackCommandEvent to complete a ranged attack command.
 * This clears the ranged attack resolution state and allows the command resolution
 * to advance to the next command.
 *
 * @param state - The current game state
 * @returns A complete CompleteRangedAttackCommandEvent
 */
export function generateCompleteRangedAttackCommandEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteRangedAttackCommandEvent<TBoard, 'completeRangedAttackCommand'> {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_RANGED_ATTACK_COMMAND_EFFECT_TYPE,
  };
}
