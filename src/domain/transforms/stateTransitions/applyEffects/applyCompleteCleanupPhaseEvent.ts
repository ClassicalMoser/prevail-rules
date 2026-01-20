import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { CompleteCleanupPhaseEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@entities';

/**
 * Applies a CompleteCleanupPhaseEvent to the game state.
 * Marks cleanup phase as complete, increments round number, and resets to playCards phase.
 *
 * @param event - The complete cleanup phase event to apply
 * @param state - The current game state
 * @returns A new game state with the round advanced
 */
export function applyCompleteCleanupPhaseEvent<TBoard extends Board>(
  event: CompleteCleanupPhaseEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = state.currentRoundState.currentPhaseState;
  
  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }
  
  if (currentPhaseState.phase !== 'cleanup') {
    throw new Error('Current phase is not cleanup');
  }
  
  if (currentPhaseState.step !== 'complete') {
    throw new Error('Cleanup phase is not on complete step');
  }

  // Increment round number
  const newRoundNumber = state.currentRoundState.roundNumber + 1;

  // Create the new play cards phase state for the next round
  const newPhaseState: PlayCardsPhaseState = {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
  };

  return {
    ...state,
    currentRoundNumber: newRoundNumber,
    currentRoundState: {
      roundNumber: newRoundNumber,
      completedPhases: new Set(), // Reset completed phases for new round
      currentPhaseState: newPhaseState,
      commandedUnits: new Set(), // Reset commanded units for new round
    },
  };
}
