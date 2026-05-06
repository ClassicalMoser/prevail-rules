import type { Board, UnitWithPlacement } from "@entities";
import type { ResolveFlankEngagementEventForBoard } from "@events";
import type {
  EngagementStateForBoard,
  FlankEngagementResolutionState,
  GameStateForBoard,
  IssueCommandsPhaseStateForBoard,
  MovementResolutionStateForBoard,
} from "@game";
import {
  getFlankEngagementStateFromMovement,
  getIssueCommandsPhaseStateForBoard,
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
  event: ResolveFlankEngagementEventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const phaseState = getIssueCommandsPhaseStateForBoard(state);
  const movementState = getMovementResolutionState(state);
  const engagementState = getFlankEngagementStateFromMovement(state);
  const flankResolutionState = engagementState.engagementResolutionState;

  const { unit, placement } = event.defenderWithPlacement;

  const removedUnitBoard = removeUnitFromBoard(state.boardState, event.defenderWithPlacement);

  const newUnitWithPlacement: UnitWithPlacement<TBoard> = {
    boardType: event.defenderWithPlacement.boardType,
    unit,
    placement: {
      ...placement,
      facing: event.newFacing,
    },
  } as UnitWithPlacement<TBoard>;
  const updatedBoard = addUnitToBoard<TBoard>(removedUnitBoard, newUnitWithPlacement);

  const newFlankResolutionState: FlankEngagementResolutionState = {
    ...flankResolutionState,
    defenderRotated: true,
  };

  const newEngagementState: EngagementStateForBoard<TBoard> = {
    ...engagementState,
    engagementResolutionState: newFlankResolutionState,
    completed: true,
  };

  const newMovementState: MovementResolutionStateForBoard<TBoard> = {
    ...movementState,
    engagementState: newEngagementState,
  };

  const newPhaseState: IssueCommandsPhaseStateForBoard<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: newMovementState,
  };

  return updatePhaseState(updateBoardState(state, updatedBoard), newPhaseState);
}
