import type {
  Board,
  BoardCoordinate,
  GameState,
  ResolveMeleePhaseState,
} from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { hasEngagedUnits, RESOLVE_MELEE_PHASE } from '@entities';
import {
  getBoardCoordinates,
  getBoardSpace,
  getIssueCommandsPhaseState,
} from '@queries';
import {
  updateCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteIssueCommandsPhaseEvent to the game state.
 * Marks issueCommands phase as complete and advances to resolveMelee phase.
 * Sets the remaining engagements to all engaged units on the board.
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

  // Find all engagements on the board
  const engagements = new Set<BoardCoordinate<TBoard>>();
  const coordinates = getBoardCoordinates(state.boardState);

  for (const coordinate of coordinates) {
    const space = getBoardSpace(state.boardState, coordinate);
    if (hasEngagedUnits(space.unitPresence)) {
      engagements.add(coordinate);
    }
  }

  // Create the new resolve melee phase state
  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    phase: RESOLVE_MELEE_PHASE,
    step: 'resolveMelee',
    currentMeleeResolutionState: undefined,
    remainingEngagements: engagements,
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
