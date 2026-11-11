import type { ResolveFlankEngagementEvent } from '@events';
import type {
  EngagementState,
  FlankEngagementResolutionState,
  GameState,
  IssueCommandsPhaseState,
  MovementResolutionState,
} from '@game';
import {
  getFlankEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';
import {
  moveUnitOnBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveFlankEngagementEvent to the game state.
 * Rotates the defending unit to face the engaging unit and marks the defender as rotated.
 * Uses `event.defenderWithPlacement` and {@link getFlankEngagementStateFromMovement} (panicky
 * narrowing); does not call `getPositionOfUnit`.
 */
export function applyResolveFlankEngagementEvent<S extends GameState>(
  event: ResolveFlankEngagementEvent,
  state: S,
): S {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getFlankEngagementStateFromMovement(state);
  const flankResolutionState = engagementState.engagementResolutionState;

  const { unit, placement } = event.defenderWithPlacement;

  // The defender is dragged round to face the engaging unit (§6.3.4).
  const updatedBoard = moveUnitOnBoard(state.boardState, unit, {
    ...placement,
    facing: event.newFacing,
  });

  const newFlankResolutionState: FlankEngagementResolutionState = {
    ...flankResolutionState,
    defenderRotated: true,
  };

  const newEngagementState: EngagementState = {
    ...engagementState,
    completed: true,
    engagementResolutionState: newFlankResolutionState,
  };

  const newMovementState: MovementResolutionState = {
    ...movementState,
    engagementState: newEngagementState,
  };

  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  return updatePhaseState(updateBoardState(state, updatedBoard), newPhaseState);
}
