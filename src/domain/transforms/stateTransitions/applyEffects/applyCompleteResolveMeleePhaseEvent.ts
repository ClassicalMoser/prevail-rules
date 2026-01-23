import type { Board, CleanupPhaseState, GameState } from '@entities';
import type { CompleteResolveMeleePhaseEvent } from '@events';
import { CLEANUP_PHASE } from '@entities';
import { getResolveMeleePhaseState } from '@queries';
import {
  markPhaseAsComplete,
  updateCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteResolveMeleePhaseEvent to the game state.
 * Marks resolveMelee phase as complete and advances to cleanup phase.
 *
 * @param event - The complete resolve melee phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteResolveMeleePhaseEvent<TBoard extends Board>(
  event: CompleteResolveMeleePhaseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getResolveMeleePhaseState(state);

  if (phaseState.step !== 'resolveMelee') {
    throw new Error('Resolve melee phase is not on resolveMelee step');
  }

  // Mark the current phase as complete
  const completedPhase = markPhaseAsComplete(phaseState);

  // Add the completed phase to the set of completed phases
  const stateWithCompletedPhase = updateCompletedPhase(state, completedPhase);

  // Create the new cleanup phase state
  const newPhaseState: CleanupPhaseState = {
    phase: CLEANUP_PHASE,
    step: 'discardPlayedCards',
    firstPlayerRallyResolutionState: undefined,
    secondPlayerRallyResolutionState: undefined,
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
