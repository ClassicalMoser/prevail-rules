import type {
  Board,
  BoardCoordinate,
  GameState,
  ResolveMeleePhaseState,
} from '@entities';
import type { CompleteIssueCommandsPhaseEvent } from '@events';
import { hasEngagedUnits, RESOLVE_MELEE_PHASE } from '@entities';
import { getBoardCoordinates, getBoardSpace } from '@queries';

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
  event: CompleteIssueCommandsPhaseEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }

  if (currentPhaseState.phase !== 'issueCommands') {
    throw new Error('Current phase is not issueCommands');
  }

  if (currentPhaseState.step !== 'complete') {
    throw new Error('Issue commands phase is not on complete step');
  }

  // Add the completed phase to the set of completed phases
  const newCompletedPhases = new Set(state.currentRoundState.completedPhases);
  newCompletedPhases.add(currentPhaseState);

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

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      completedPhases: newCompletedPhases,
      currentPhaseState: newPhaseState,
    },
  };
}
