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
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The game state, carrying out a unit's move that has been written and landed
 * @returns A new game state with no unit's move under way, on the same step
 * @throws Error when the move was never written, or the mover does not stand where it ends
 */
export function applyCompleteUnitMovementEvent<S extends GameState>(
  _event: CompleteUnitMovementEvent,
  state: S,
): S {
  // The unit's move under way, carried out one unit at a time (§4.3.9).
  const movementState = getMovementResolutionState(state);

  // A move is only completed once it has been written.
  // The expected engine asks for this effect only after the player wrote the
  // move (`moveUnit`), so a move still unwritten is a fault in the sequence.
  const targetPlacement = throwIfPending(
    movementState.targetPlacement,
    'The move has not been written yet',
  );

  // By now the mover stands where its move ends, however the move went. A
  // mover anywhere else is a fault in whatever wrote the move.
  // Read by who the mover is, from the board: facing is half of where a unit
  // stands (§2.3), so the space and the facing must both match.
  const standing = getPositionOfUnit(state, movementState.movingUnit);
  if (!isSamePlacement(standing, targetPlacement)) {
    throw new Error('The mover has not been set down where its move ends');
  }

  // The unit's move is done. Whether the order goes on to another unit or
  // ends is the expected engine's to ask for.
  const cleared = clearCommandResolution(state);

  // The same step, with no unit's move under way, ready for the next unit's
  // move or the order's end.
  return cleared;
}
