import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { ResolveFlankEngagementEvent } from '@events';
import {
  getEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
  getPositionOfUnit,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveFlankEngagementEvent to the game state.
 * Rotates the defending unit to face the engaging unit and marks the defender as rotated.
 *
 * @param event - The resolve flank engagement event to apply
 * @param state - The current game state
 * @returns A new game state with the defending unit rotated and marked as rotated
 */
export function applyResolveFlankEngagementEvent<TBoard extends Board>(
  event: ResolveFlankEngagementEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getEngagementStateFromMovement(state);

  if (engagementState.engagementResolutionState.engagementType !== 'flank') {
    throw new Error('Engagement type is not flank');
  }

  const flankResolutionState = engagementState.engagementResolutionState;

  // Get the defending unit's current position
  const currentPosition = getPositionOfUnit(
    state.boardState,
    event.defendingUnit,
  );

  // Remove unit from board
  const removedUnitBoard = removeUnitFromBoard<TBoard>(state.boardState, {
    unit: event.defendingUnit,
    placement: currentPosition,
  });

  // Add unit back with new facing
  const newUnitPlacement = {
    coordinate: currentPosition.coordinate,
    facing: event.newFacing,
  };
  const updatedBoard = addUnitToBoard<TBoard>(removedUnitBoard, {
    unit: event.defendingUnit,
    placement: newUnitPlacement,
  });

  // Update flank engagement resolution state
  const newFlankResolutionState = {
    ...flankResolutionState,
    defenderRotated: true,
  };

  // Update engagement state
  const newEngagementState = {
    ...engagementState,
    engagementResolutionState: newFlankResolutionState,
    completed: true, // Flank engagement is complete after rotation
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
    boardState: updatedBoard,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
