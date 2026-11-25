import type { MoveUnitEvent } from '@events';
import type { GameState, MovementResolutionState } from '@game';
import {
  getBoardSpace,
  getMovementResolutionState,
  getPlacementAfterPath,
  getPositionOfUnit,
  hasEnemyUnit,
} from '@queries';
import {
  carryRidingCommander,
  moveUnitOnBoard,
  updateCommandResolutionState,
} from '@transforms/pureTransforms';

/**
 * Applies a MoveUnitEvent: the move is written into the movement its unit's
 * `chooseMovingUnit` opened (§4.3.10).
 *
 * - Open ground: the mover leaves its space and stands where the path ends.
 * - An enemy's space: the mover waits on its start space until the
 *   engagement places it, so that the engagement samples its Speed there,
 *   where the move began (§5.1.4).
 *
 * Event is assumed pre-validated (a legal path for the moving unit).
 */
export function applyMoveUnitEvent<S extends GameState>(
  event: MoveUnitEvent,
  state: S,
): S {
  const movement = getMovementResolutionState(state);
  const mover = movement.movingUnit;

  // The destination is wherever the validated path leads from where the
  // mover stands, read by geometry rather than judged again.
  const destination = getPlacementAfterPath(
    state.boardState,
    getPositionOfUnit(state, mover),
    event.path,
    'advance',
  );

  const written: MovementResolutionState = {
    ...movement,
    moveCommander: event.moveCommander,
    targetPlacement: destination,
  };

  // Into an enemy, the mover waits, and so does a commander riding with it;
  // onto open ground, both move now.
  const targetSpace = getBoardSpace(state.boardState, destination.coordinate);
  const enteringEnemy = hasEnemyUnit(event.player, targetSpace);
  const withMover = enteringEnemy
    ? state
    : carryRidingCommander(
        moveUnitOnBoard(state, mover, destination),
        written,
        destination.coordinate,
      );

  const moved = updateCommandResolutionState(withMover, written);
  return moved;
}
