import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  UnitWithPlacement,
} from '@entities';
import type { ResolveFlankEngagementEvent } from '@events';
import {
  getFlankEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a ResolveFlankEngagementEvent to the game state.
 * Rotates the defending unit to face the engaging unit and marks the defender as rotated.
 * Uses `event.defenderWithPlacement` and {@link getFlankEngagementStateFromMovement} (panicky
 * narrowing); does not call `getPositionOfUnit`.
 */
export function applyResolveFlankEngagementEvent<TBoard extends Board>(
  event: ResolveFlankEngagementEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getFlankEngagementStateFromMovement(state);
  const flankResolutionState = engagementState.engagementResolutionState;

  const { unit, placement } = event.defenderWithPlacement;

  const removedUnitBoard = removeUnitFromBoard<TBoard>(state.boardState, {
    unit,
    placement,
  });

  const newUnitWithPlacement: UnitWithPlacement<TBoard> = {
    unit,
    placement: {
      ...placement,
      facing: event.newFacing,
    },
  };
  const updatedBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    newUnitWithPlacement,
  );

  const newFlankResolutionState = {
    ...flankResolutionState,
    defenderRotated: true,
  };

  const newEngagementState = {
    ...engagementState,
    engagementResolutionState: newFlankResolutionState,
    completed: true,
  };

  const newMovementState = {
    ...movementState,
    engagementState: newEngagementState,
  };

  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  return updatePhaseState(
    { ...state, boardState: updatedBoard },
    newPhaseState,
  );
}
