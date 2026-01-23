import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { CompleteCleanupPhaseEvent } from '@events';
import { PLAY_CARDS_PHASE } from '@entities';
import { getCleanupPhaseState } from '@queries';
import {
  updateCurrentRoundNumber,
  updateRoundState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteCleanupPhaseEvent to the game state.
 * Marks cleanup phase as complete, increments round number, and resets to playCards phase.
 *
 * @param event - The complete cleanup phase event to apply
 * @param state - The current game state
 * @returns A new game state with the round advanced
 */
export function applyCompleteCleanupPhaseEvent<TBoard extends Board>(
  event: CompleteCleanupPhaseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getCleanupPhaseState(state);

  if (phaseState.step !== 'complete') {
    throw new Error('Cleanup phase is not on complete step');
  }

  // Increment round number
  const newRoundNumber = state.currentRoundState.roundNumber + 1;

  // Create the new play cards phase state for the next round
  const newPhaseState: PlayCardsPhaseState = {
    phase: PLAY_CARDS_PHASE,
    step: 'chooseCards',
  };

  const stateWithRound = updateRoundState(state, {
    roundNumber: newRoundNumber,
    completedPhases: new Set(), // Reset completed phases for new round
    currentPhaseState: newPhaseState,
    commandedUnits: new Set(), // Reset commanded units for new round
  });

  const finalState = updateCurrentRoundNumber(stateWithRound, newRoundNumber);

  return finalState;
}
