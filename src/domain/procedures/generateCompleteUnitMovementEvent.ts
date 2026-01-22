import type { Board, GameState } from '@entities';
import type { CompleteUnitMovementEvent } from '@events';
import {
  COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompleteUnitMovementEvent to complete a unit movement.
 * This marks that a unit's movement command has been fully resolved.
 *
 * @param state - The current game state
 * @returns A complete CompleteUnitMovementEvent
 */
export function generateCompleteUnitMovementEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): CompleteUnitMovementEvent<TBoard, 'completeUnitMovement'> {
  // Return is independent of state, so we can ignore it
  const _stateUnused = state;
  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: COMPLETE_UNIT_MOVEMENT_EFFECT_TYPE,
  };
}
