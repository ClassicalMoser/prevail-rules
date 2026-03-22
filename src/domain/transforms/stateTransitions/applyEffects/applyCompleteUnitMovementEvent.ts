import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  MovementResolutionState,
} from '@entities';
import type { CompleteUnitMovementEvent } from '@events';
import {
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a CompleteUnitMovementEvent to the game state.
 * Marks the movement resolution state as completed, allowing command resolution to advance.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the movement resolution state marked as completed
 */
export function applyCompleteUnitMovementEvent<TBoard extends Board>(
  _event: CompleteUnitMovementEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);

  // Mark as completed
  const newMovementState: MovementResolutionState<TBoard> = {
    ...movementState,
    completed: true,
  };

  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  return updatePhaseState(state, newPhaseState);
}
