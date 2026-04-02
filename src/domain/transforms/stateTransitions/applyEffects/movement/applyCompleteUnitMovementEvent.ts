import type { Board } from '@entities';
import type { CompleteUnitMovementEvent } from '@events';
import type { GameStateWithBoard, MovementResolutionState } from '@game';
import { getMovementResolutionState } from '@queries';
import { updateCommandResolutionState } from '@transforms/pureTransforms';

/**
 * Applies a CompleteUnitMovementEvent to the game state.
 * Marks the movement resolution state as completed, allowing command resolution to advance.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the movement resolution state marked as completed
 *
 * Uses {@link getMovementResolutionState} and {@link updateCommandResolutionState}.
 */
export function applyCompleteUnitMovementEvent<TBoard extends Board>(
  _event: CompleteUnitMovementEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const movementState = getMovementResolutionState(state);

  const newMovementState: MovementResolutionState = {
    ...movementState,
    completed: true,
  };

  return updateCommandResolutionState(state, newMovementState);
}
