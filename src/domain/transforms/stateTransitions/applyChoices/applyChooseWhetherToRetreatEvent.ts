import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import {
  getEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';

/**
 * Applies a ChooseWhetherToRetreatEvent to the game state.
 * Updates the defendingUnitRetreats flag in the front engagement resolution state.
 *
 * @param event - The choose whether to retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat decision recorded
 */
export function applyChooseWhetherToRetreatEvent<TBoard extends Board>(
  event: ChooseWhetherToRetreatEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getEngagementStateFromMovement(state);

  if (engagementState.engagementResolutionState.engagementType !== 'front') {
    throw new Error('Engagement type is not front');
  }

  const frontResolutionState = engagementState.engagementResolutionState;

  // Update engagement resolution state with the retreat decision
  const newFrontResolutionState = {
    ...frontResolutionState,
    defendingUnitRetreats: event.choosesToRetreat,
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
