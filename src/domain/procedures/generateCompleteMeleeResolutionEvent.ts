import type { Board, GameState } from '@entities';
import type { CompleteMeleeResolutionEvent } from '@events';
import {
  COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteMeleeResolutionEvent to complete a melee resolution.
 * This clears the currentMeleeResolutionState and allows the phase to continue
 * to the next engagement or complete.
 *
 * @param state - The current game state
 * @returns A complete CompleteMeleeResolutionEvent
 */
export function generateCompleteMeleeResolutionEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteMeleeResolutionEvent<TBoard, 'completeMeleeResolution'> {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE,
  };
}
