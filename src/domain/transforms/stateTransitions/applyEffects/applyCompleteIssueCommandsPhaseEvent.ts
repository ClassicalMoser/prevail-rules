import type {
  Board,
  BoardCoordinate,
  GameState,
  ResolveMeleePhaseState,
} from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { RESOLVE_MELEE_PHASE } from '@entities';
import { getIssueCommandsPhaseState } from '@queries';
import {
  updateCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteIssueCommandsPhaseEvent to the game state.
 * Marks issueCommands phase as complete and advances to resolveMelee phase.
 * Uses the engagements from the event to populate remaining engagements.
 *
 * @param event - The complete issue commands phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteIssueCommandsPhaseEvent<TBoard extends Board>(
  event: CompleteIssueCommandsPhaseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);

  if (phaseState.step !== 'complete') {
    throw new Error('Issue commands phase is not on complete step');
  }

  // Add the completed phase to the set of completed phases
  const stateWithCompletedPhase = updateCompletedPhase(state, phaseState);

  // Create the new resolve melee phase state using engagements from the event
  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    phase: RESOLVE_MELEE_PHASE,
    step: 'resolveMelee',
    currentMeleeResolutionState: undefined,
    remainingEngagements: event.engagements as Set<BoardCoordinate<TBoard>>,
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
