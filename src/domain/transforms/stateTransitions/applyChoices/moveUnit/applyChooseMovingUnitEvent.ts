import type { ChooseMovingUnitEvent } from '@events';
import type { GameState, MovementResolutionState } from '@game';
import {
  arrayWithoutUnit,
  getRemainingUnitsForPlayer,
  getUnitWithPlacementOnBoard,
} from '@queries';
import {
  openCommandResolution,
  updateRemainingUnitsForPlayer,
} from '@transforms/pureTransforms';

/**
 * Applies a ChooseMovingUnitEvent: the named unit's move begins (§4.3.10).
 * A movement resolution opens for it with its owner's commitment still to
 * come, and nothing yet written of the move itself; and the unit leaves the
 * list of those the order has still to move, since each is moved once.
 *
 * Event is assumed pre-validated (the unit is one the order may move next).
 *
 * @param event - The player naming the unit to move next
 * @param state - The game, in Phase 3, with no unit's move or shot under way
 * @returns The game with that unit's move under way
 * @throws Error when the named unit is not on the board, or another unit's
 * move or shot is still under way
 */
export function applyChooseMovingUnitEvent<S extends GameState>(
  event: ChooseMovingUnitEvent,
  state: S,
): S {
  // The order is carried out unit by unit; this one is now under way.
  const remaining = getRemainingUnitsForPlayer(state, event.player);
  const stillToMove = arrayWithoutUnit(remaining, event.unit);

  // The event names the unit by who it is; the unit that moves, with the
  // stats it carries, is the one the board holds.
  const mover = getUnitWithPlacementOnBoard(state, event.unit).unit;

  // The move opens with the commitment owed and the move unwritten: the
  // owner may commit a card first, and the card counts toward the move.
  // TODO(composition): every other substep is built as it opens by a factory
  // in `factories/substeps` (`createOpenedMeleeResolutionState`,
  // `createOpenedRetreatState`, ...); this one, and the shot that
  // `applyChooseShooterEvent` opens, are written out here instead. Settled by
  // a `createOpenedMovementResolutionState(movingUnit)` beside them.
  const movement: MovementResolutionState = {
    commandResolutionType: 'movement',
    commitment: { commitmentType: 'pending' },
    completed: false,
    // Whether the move walks into an enemy is known only once it is written.
    engagementState: 'pending',
    // Whether a commander rides along is declared with the move (§4.3.10).
    moveCommander: 'pending',
    movingUnit: mover,
    substepType: 'commandResolution',
    targetPlacement: 'pending',
  };

  // The unit is struck off the order's list first, so that it cannot be
  // named again this round (§4.3.6).
  const struckOff = updateRemainingUnitsForPlayer(
    state,
    event.player,
    stillToMove,
  );

  // Units are moved one at a time, each finished before the next begins
  // (§4.3.9); `openCommandResolution` refuses a second while one is under way.
  const opened = openCommandResolution(struckOff, movement);

  // The game, waiting on the owner's commitment for this move.
  return opened;
}
