import type { Board, GameState } from '@entities';
import type { ChooseWhetherToRetreatEvent } from '@events';
import { getFrontEngagementStateFromMovement } from '@queries';
import { updateEngagementStateInMovement } from '@transforms/pureTransforms';

/**
 * Applies a ChooseWhetherToRetreatEvent to the game state.
 * Updates the defendingUnitRetreats flag in the front engagement resolution state.
 * Event is assumed pre-validated (issueCommands phase, movement with front engagement).
 *
 * @param event - The choose whether to retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat decision recorded
 */
export function applyChooseWhetherToRetreatEvent<TBoard extends Board>(
  event: ChooseWhetherToRetreatEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  // Finds the front engagement state from the movement state
  const engagementState = getFrontEngagementStateFromMovement(state);

  // Record retreat decision in front engagement resolution state
  const newEngagementState = {
    ...engagementState,
    engagementResolutionState: {
      ...engagementState.engagementResolutionState,
      defendingUnitRetreats: event.choosesToRetreat,
    },
  };

  const newGameState = updateEngagementStateInMovement(
    state,
    newEngagementState,
  );
  return newGameState;
}
