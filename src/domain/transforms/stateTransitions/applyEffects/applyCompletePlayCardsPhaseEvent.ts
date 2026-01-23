import type { Board, GameState, MoveCommandersPhaseState } from '@entities';
import type { CompletePlayCardsPhaseEvent } from '@events';
import { MOVE_COMMANDERS_PHASE } from '@entities';
import { getPlayCardsPhaseState } from '@queries';
import {
  updateCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompletePlayCardsPhaseEvent to the game state.
 * Marks playCards phase as complete and advances to moveCommanders phase.
 *
 * @param event - The complete play cards phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompletePlayCardsPhaseEvent<TBoard extends Board>(
  event: CompletePlayCardsPhaseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getPlayCardsPhaseState(state);

  if (phaseState.step !== 'complete') {
    throw new Error('Play cards phase is not on complete step');
  }

  // Add the completed phase to the set of completed phases
  const stateWithCompletedPhase = updateCompletedPhase(state, phaseState);

  // Create the new move commanders phase state
  const newPhaseState: MoveCommandersPhaseState = {
    phase: MOVE_COMMANDERS_PHASE,
    step: 'moveFirstCommander',
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
