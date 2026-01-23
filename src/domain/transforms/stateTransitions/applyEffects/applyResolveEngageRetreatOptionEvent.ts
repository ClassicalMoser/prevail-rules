import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { ResolveEngageRetreatOptionEvent } from '@events';
import {
  getEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';

/**
 * Applies a ResolveEngageRetreatOptionEvent to the game state.
 * Updates the defendingUnitCanRetreat flag in the front engagement resolution state.
 *
 * @param event - The resolve engage retreat option event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat option resolved
 */
export function applyResolveEngageRetreatOptionEvent<TBoard extends Board>(
  event: ResolveEngageRetreatOptionEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getEngagementStateFromMovement(state);

  if (engagementState.engagementResolutionState.engagementType !== 'front') {
    throw new Error('Engagement type is not front');
  }

  const frontResolutionState = engagementState.engagementResolutionState;

  // Update front engagement resolution state with retreat option
  const newFrontResolutionState = {
    ...frontResolutionState,
    defendingUnitCanRetreat: event.defendingUnitCanRetreat,
  };

  // Update engagement state
  const newEngagementState = {
    ...engagementState,
    engagementResolutionState: newFrontResolutionState,
  };

  // Update movement resolution state
  const newMovementState = {
    ...movementState,
    engagementState: newEngagementState,
  };

  // Update phase state
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
