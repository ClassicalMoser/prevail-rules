import type { Board, GameState, MoveCommandersPhaseState } from '@entities';
import type { CompletePlayCardsPhaseEvent } from '@events';
import { MOVE_COMMANDERS_PHASE } from '@entities';

/**
 * Applies a CompletePlayCardsPhaseEvent to the game state.
 * Marks playCards phase as complete and advances to moveCommanders phase.
 *
 * @param event - The complete play cards phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompletePlayCardsPhaseEvent<TBoard extends Board>(
  event: CompletePlayCardsPhaseEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = state.currentRoundState.currentPhaseState;
  
  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }
  
  if (currentPhaseState.phase !== 'playCards') {
    throw new Error('Current phase is not playCards');
  }
  
  if (currentPhaseState.step !== 'complete') {
    throw new Error('Play cards phase is not on complete step');
  }


  // Add the completed phase to the set of completed phases
  const newCompletedPhases = new Set(state.currentRoundState.completedPhases);
  newCompletedPhases.add(currentPhaseState);

  // Create the new move commanders phase state
  const newPhaseState: MoveCommandersPhaseState = {
    phase: MOVE_COMMANDERS_PHASE,
    step: 'moveFirstCommander',
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
