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
 * Applies a MoveUnitEvent to the game state.
 *
 * - Removes the mover from its origin; if the destination is empty, places it
 *   there. If the destination holds an enemy, the mover stays off-board in the
 *   movement CRS so `startEngagement` can still read a lone defender (board
 *   stacking / facing happens when movement completes).
 * - Removes the moving unit from that player's `remainingUnits*`
 * - Starts a movement CRS so `advanceEffects` can continue through engagement
 *   (if any) / complete. Mover card commitment is declined by default.
 *
 * Event is assumed pre-validated (legal move, unit at event.unit.placement).
 */
export function applyMoveUnitEvent<S extends GameState>(
  event: MoveUnitEvent,
  state: S,
): S {
  const originalUnitWithPlacement = event.unit;
  const newUnitWithPlacement = {
    ...originalUnitWithPlacement,
    placement: event.to,
  };

  const removedUnitBoard = removeUnitFromBoard(
    state.boardState,
    originalUnitWithPlacement,
  );
  const targetSpace = getBoardSpace(removedUnitBoard, event.to.coordinate);
  const enteringEnemy = hasEnemyUnit(event.player, targetSpace).result;
  const newBoard = enteringEnemy
    ? removedUnitBoard
    : addUnitToBoard(removedUnitBoard, newUnitWithPlacement);
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
    movingUnit: newUnitWithPlacement,
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
