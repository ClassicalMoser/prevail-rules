import type { Board } from '@entities';
import type { ResolveEngageRetreatOptionEvent } from '@events';
import type {
  GameStateWithBoard,
  IssueCommandsPhaseState,
  MovementResolutionState,
  PhaseState,
} from '@game';
import {
  getFrontEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a ResolveEngageRetreatOptionEvent to the game state.
 * Updates the defendingUnitCanRetreat flag in the front engagement resolution state.
 * Uses {@link getFrontEngagementStateFromMovement} (panicky narrowing) instead of a manual
 * front-type check.
 *
 * @param event - The resolve engage retreat option event to apply
 * @param state - The current game state
 * @returns A new game state with the retreat option resolved
 */
export function applyResolveEngageRetreatOptionEvent<TBoard extends Board>(
  event: ResolveEngageRetreatOptionEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getFrontEngagementStateFromMovement(state);

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
  } as MovementResolutionState;

  // Update phase state
  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  return updatePhaseState(state, newPhaseState as PhaseState);
}
