import type { Board, UnitWithPlacement } from '@entities';
import type { ResolveFlankEngagementEvent } from '@events';
import type {
  EngagementState,
  FlankEngagementResolutionState,
  GameStateForBoard,
  IssueCommandsPhaseState,
  MovementResolutionState,
} from '@game';
import {
  getFlankEngagementStateFromMovement,
  getIssueCommandsPhaseStateForBoard,
  getMovementResolutionState,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveFlankEngagementEvent to the game state.
 * Rotates the defending unit to face the engaging unit and marks the defender as rotated.
 * Uses `event.defenderWithPlacement` and {@link getFlankEngagementStateFromMovement} (panicky
 * narrowing); does not call `getPositionOfUnit`.
 */
export function applyResolveFlankEngagementEvent<TBoard extends Board>(
  event: ResolveFlankEngagementEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const phaseState = getIssueCommandsPhaseStateForBoard(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getFlankEngagementStateFromMovement(state);
  const flankResolutionState = engagementState.engagementResolutionState;

  const { unit, placement } = event.defenderWithPlacement;

  const removedUnitBoard = removeUnitFromBoard(
    state.boardState as TBoard,
    event.defenderWithPlacement,
  );

  const newUnitWithPlacement: UnitWithPlacement = {
    placement: {
      ...placement,
      facing: event.newFacing,
    },
    unit,
  };
  const updatedBoard = addUnitToBoard(
    removedUnitBoard,
    newUnitWithPlacement,
  );

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
