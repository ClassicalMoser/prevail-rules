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
 *
 * @param event - The path the player wrote, and whether the commander rides
 * @param state - The game, with a unit's move opened and its commitment settled
 * @returns The game with the move written, and the unit moved if it met no enemy
 * @throws Error when no move is under way, or the path runs off the board
 */
export function applyMoveUnitEvent<S extends GameState>(
  event: MoveUnitEvent,
  state: S,
): S {
  // The move under way, and the unit it is for, as `chooseMovingUnit` named it.
  const movement = getMovementResolutionState(state);
  const mover = movement.movingUnit;

  // The destination is wherever the validated path leads from where the
  // mover stands, read by geometry rather than judged again. A unit only
  // ever steps the way it faces (§5.1.3), so every step advances.
  const start = getPositionOfUnit(state, mover);
  const destination = getPlacementAfterPath(
    state.boardState,
    start,
    event.path,
    'advance',
  );

  // The move records where it ends and whether the commander rides with it;
  // whatever follows (an engagement, or the move's end) reads both from here.
  const written: MovementResolutionState = {
    ...movement,
    moveCommander: event.moveCommander,
    targetPlacement: destination,
  };

  // Into an enemy, the mover waits, and so does a commander riding with it;
  // onto open ground, both move now.
  // TODO(composition): whether the move ends on an enemy is asked of the board
  // here and again by `getExpectedMovementResolutionEvent`, which owes
  // `startEngagement` on the same answer; the applyEffects README counts
  // "whether a move enters an enemy" among what an apply should not decide.
  // Settled by one owner of the answer: the event carrying it, or the mover
  // always waiting for the effect that follows (`startEngagement` or
  // `completeUnitMovement`) to set it down.
  const targetSpace = getBoardSpace(state.boardState, destination.coordinate);
  const enteringEnemy = hasEnemyUnit(event.player, targetSpace);
  if (enteringEnemy) {
    // Nothing moves yet: only the written move is recorded.
    const waiting = updateCommandResolutionState(state, written);

    // The game, waiting on the engagement.
    return waiting;
  }

  // Onto open ground the unit stands where the path ends, and a commander
  // riding with it ends in the same space (§4.3.10).
  const landed = moveUnitOnBoard(state, mover, destination);
  const withCommander = carryRidingCommander(
    landed,
    written,
    destination.coordinate,
  );

  // The written move replaces the unwritten one.
  const moved = updateCommandResolutionState(withCommander, written);

  // The game, waiting on the end of the move.
  return moved;
}
