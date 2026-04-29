import type { Board, UnitWithPlacement } from "@entities";
import type { ResolveFlankEngagementEvent } from "@events";
import type {
  GameStateWithBoard,
  IssueCommandsPhaseState,
  MovementResolutionState,
  PhaseState,
} from "@game";
import {
  getFlankEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from "@queries";
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateBoardState,
  updatePhaseState,
} from "@transforms/pureTransforms";

/**
 * Applies a ResolveFlankEngagementEvent to the game state.
 * Rotates the defending unit to face the engaging unit and marks the defender as rotated.
 * Uses `event.defenderWithPlacement` and {@link getFlankEngagementStateFromMovement} (panicky
 * narrowing); does not call `getPositionOfUnit`.
 */
export function applyResolveFlankEngagementEvent<TBoard extends Board>(
  event: ResolveFlankEngagementEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getFlankEngagementStateFromMovement(state);
  const flankResolutionState = engagementState.engagementResolutionState;

  const { unit, placement } = event.defenderWithPlacement;

  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    event.defenderWithPlacement as UnitWithPlacement<TBoard>,
  );

  const newUnitWithPlacement = {
    boardType: event.defenderWithPlacement.boardType,
    unit,
    placement: {
      ...placement,
      facing: event.newFacing,
    },
  } as UnitWithPlacement<TBoard>;
  const updatedBoard = addUnitToBoard<TBoard>(removedUnitBoard, newUnitWithPlacement);

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
  } as MovementResolutionState;

  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  return updatePhaseState(updateBoardState(state, updatedBoard), newPhaseState as PhaseState);
}
