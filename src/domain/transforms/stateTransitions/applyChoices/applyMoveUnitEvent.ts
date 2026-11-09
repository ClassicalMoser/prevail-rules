import type { MoveUnitEvent } from '@events';
import type { GameState, MovementResolutionState } from '@game';
import {
  getBoardSpace,
  getMovementResolutionState,
  getPlacementAfterPath,
  hasEnemyUnit,
} from '@queries';
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateBoardState,
  updateCommandResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a MoveUnitEvent: the move is written into the movement its unit's
 * `chooseMovingUnit` opened (§4.3.10).
 *
 * - Open ground: the mover leaves its space and stands where the path ends.
 * - An enemy's space: the mover waits on its start space, where its stats
 *   were read (§5.1.4), until the engagement places it.
 *
 * Event is assumed pre-validated (a legal path for the moving unit).
 */
export function applyMoveUnitEvent<S extends GameState>(
  event: MoveUnitEvent,
  state: S,
): S {
  const movement = getMovementResolutionState(state);
  const mover = movement.movingUnit;

  // The destination is wherever the validated path leads (A11), read by
  // geometry rather than judged again.
  const destination = getPlacementAfterPath(
    state.boardState,
    mover.placement,
    event.path,
    'advance',
  );
  if (destination === undefined) {
    throw new Error('The move path leaves the board');
  }

  // Into an enemy, the mover waits; onto open ground, it moves now.
  const targetSpace = getBoardSpace(state.boardState, destination.coordinate);
  const enteringEnemy = hasEnemyUnit(event.player, targetSpace).result;
  const arrived = { ...mover, placement: destination };
  const movingUnit = enteringEnemy ? mover : arrived;
  const board = enteringEnemy
    ? state.boardState
    : addUnitToBoard(removeUnitFromBoard(state.boardState, mover), arrived);
  const withBoard = updateBoardState(state, board);

  const written: MovementResolutionState = {
    ...movement,
    moveCommander: event.moveCommander,
    movingUnit,
    targetPlacement: destination,
  };
  const moved = updateCommandResolutionState(withBoard, written);
  return moved;
}
