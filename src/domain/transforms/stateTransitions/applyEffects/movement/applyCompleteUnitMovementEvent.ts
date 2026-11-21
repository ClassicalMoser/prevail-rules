import type { CompleteUnitMovementEvent } from '@events';
import type { GameState } from '@game';
import {
  getMovementResolutionState,
  getPositionOfUnit,
  isSamePlacement,
} from '@queries';
import { clearCommandResolution } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

/**
 * Finishes a movement command-resolution slice. The mover already stands
 * where its move ends: set down there by the move itself onto open ground,
 * and by the engagement when it moved into an enemy. Clears CRS back to
 * `pending`. Whether
 * the order goes on to another unit, or ends with completeMovementCommand, is
 * the expected engine's to ask for.
 *
 * Mirrors `applyCompleteRangedAttackEvent` for a shot.
 */
export function applyCompleteUnitMovementEvent<S extends GameState>(
  _event: CompleteUnitMovementEvent,
  state: S,
): S {
  const movementState = getMovementResolutionState(state);
  // A move is only completed once it has been written.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );
  // By now the mover stands where its move ends, however the move went. A
  // mover anywhere else is a fault in whatever wrote the move.
  const standing = getPositionOfUnit(state, movementState.movingUnit);
  if (!isSamePlacement(standing, targetPlacement)) {
    throw new Error('The mover has not been set down where its move ends');
  }

  // The unit's move is done. Whether the order goes on to another unit or
  // ends is the expected engine's to ask for.
  const cleared = clearCommandResolution(state);
  return cleared;
}
