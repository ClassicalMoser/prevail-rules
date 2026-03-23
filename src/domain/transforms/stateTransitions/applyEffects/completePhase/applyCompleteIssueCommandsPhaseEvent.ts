import type { Board, GameState, ResolveMeleePhaseState } from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { RESOLVE_MELEE_PHASE } from '@entities';
import { getCurrentPhaseState } from '@queries';
import {
  addCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteIssueCommandsPhaseEvent to the game state.
 * Records the current phase state as completed and advances to resolveMelee phase.
 * Uses `remainingEngagements` from the event (procedure / machine-generated log).
 *
 * Phase and step are not re-validated here; the event is trusted from the procedure /
 * machine-generated log.
 *
 * @param event - The complete issue commands phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteIssueCommandsPhaseEvent<TBoard extends Board>(
  event: CompleteIssueCommandsPhaseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getCurrentPhaseState(state);

  const stateWithCompletedPhase = addCompletedPhase(state, phaseState);

  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    phase: RESOLVE_MELEE_PHASE,
    step: 'resolveMelee',
    // Initialize with undefined, resolution order is up to the player
    currentMeleeResolutionState: undefined,
    // Initialize with all engaged units on the board,
    // set in the event (procedure / machine-generated log)
    remainingEngagements: event.remainingEngagements,
  };

  const newState = updatePhaseState(stateWithCompletedPhase, newPhaseState);
  return newState;
}
