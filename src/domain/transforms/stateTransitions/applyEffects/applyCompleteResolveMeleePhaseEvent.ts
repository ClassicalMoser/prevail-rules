import type { Board, CleanupPhaseState, GameState } from '@entities';
import type { CompleteResolveMeleePhaseEvent } from '@events';
import { CLEANUP_PHASE } from '@entities';

/**
 * Applies a CompleteResolveMeleePhaseEvent to the game state.
 * Marks resolveMelee phase as complete and advances to cleanup phase.
 *
 * @param event - The complete resolve melee phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteResolveMeleePhaseEvent<TBoard extends Board>(
  event: CompleteResolveMeleePhaseEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }

  if (currentPhaseState.phase !== 'resolveMelee') {
    throw new Error('Current phase is not resolveMelee');
  }

  if (currentPhaseState.step !== 'resolveMelee') {
    throw new Error('Resolve melee phase is not on resolveMelee step');
  }

  // Mark the current phase as complete
  const completedPhase = {
    ...currentPhaseState,
    step: 'complete' as const,
  };

  // Add the completed phase to the set of completed phases
  const newCompletedPhases = new Set(state.currentRoundState.completedPhases);
  newCompletedPhases.add(completedPhase);

  // Create the new cleanup phase state
  const newPhaseState: CleanupPhaseState = {
    phase: CLEANUP_PHASE,
    step: 'discardPlayedCards',
    firstPlayerRallyResolutionState: undefined,
    secondPlayerRallyResolutionState: undefined,
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      completedPhases: newCompletedPhases,
      currentPhaseState: newPhaseState,
    },
  };
}
