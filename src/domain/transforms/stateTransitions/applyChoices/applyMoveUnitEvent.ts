import type { Board, UnitWithPlacement } from '@entities';
import type { MoveUnitEvent } from '@events';
import type {
  GameState,
  IssueCommandsPhaseState,
  MovementResolutionState,
} from '@game';
import {
  getBoardSpace,
  getIssueCommandsPhaseState,
  hasEnemyUnit,
  isSameUnitInstance,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Empty destination: take the mover off its current hex and set it on the target.
 */
function boardWithMoverOnEmptyHex(
  board: Board,
  from: UnitWithPlacement,
  to: UnitWithPlacement,
): Board {
  const boardWithoutMover = removeUnitFromBoard(board, from);
  const occupied = addUnitToBoard(boardWithoutMover, to);
  return occupied;
}

/**
 * Applies a MoveUnitEvent to the game state.
 *
 * - Empty destination: the mover leaves its current hex and occupies the target.
 * - Enemy destination: the mover has not moved yet. It stays on its current hex
 *   so stat lookups (inspiration range) still find it. The defender remains the
 *   only unit on the target until movement completes.
 * - Removes the moving unit from that player's `remainingUnits*`
 * - Starts a movement CRS so `advanceEffects` can continue through engagement
 *   (if any) / complete. Mover card commitment is declined by default.
 *   `movingUnit.placement` is where the unit is now. `targetPlacement` is where
 *   the move is going.
 *
 * Event is assumed pre-validated (legal move, unit at event.unit.placement).
 */
export function applyMoveUnitEvent<S extends GameState>(
  event: MoveUnitEvent,
  state: S,
): S {
  const originalUnitWithPlacement = event.unit;
  const movedUnitWithPlacement = {
    ...originalUnitWithPlacement,
    placement: event.to,
  };

  const targetSpace = getBoardSpace(state.boardState, event.to.coordinate);
  const enteringEnemy = hasEnemyUnit(event.player, targetSpace).result;
  // An enemy hex is not entered yet. The mover stays where it stands.
  const movingUnit = enteringEnemy
    ? originalUnitWithPlacement
    : movedUnitWithPlacement;
  const newBoard = enteringEnemy
    ? state.boardState
    : boardWithMoverOnEmptyHex(
        state.boardState,
        originalUnitWithPlacement,
        movedUnitWithPlacement,
      );
  const stateWithBoard = updateBoardState(state, newBoard);

  const phaseState = getIssueCommandsPhaseState(stateWithBoard);
  const isFirstPlayer = event.player === state.currentInitiative;
  const remaining = isFirstPlayer
    ? phaseState.remainingUnitsFirstPlayer
    : phaseState.remainingUnitsSecondPlayer;

  const newRemaining = [...remaining].filter(
    (unit) => !isSameUnitInstance(unit, event.unit.unit).result,
  );

  const movementResolutionState: MovementResolutionState = {
    commandResolutionType: 'movement',
    commitment: { commitmentType: 'declined' },
    completed: false,
    engagementState: 'pending',
    moveCommander: event.moveCommander,
    movingUnit,
    substepType: 'commandResolution',
    targetPlacement: event.to,
  };

  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: movementResolutionState,
    remainingUnitsFirstPlayer: isFirstPlayer
      ? newRemaining
      : phaseState.remainingUnitsFirstPlayer,
    remainingUnitsSecondPlayer: isFirstPlayer
      ? phaseState.remainingUnitsSecondPlayer
      : newRemaining,
  };

  return updatePhaseState(stateWithBoard, newPhaseState);
}
