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
 */
export function applyChooseMovingUnitEvent<S extends GameState>(
  event: ChooseMovingUnitEvent,
  state: S,
): S {
  // The order is carried out unit by unit; this one is now under way.
  const remaining = getRemainingUnitsForPlayer(state, event.player);
  const stillToMove = arrayWithoutUnit(remaining, event.unit.unit);

  // The event names the unit by who it is; the unit that moves, with the
  // stats it carries, is the one the board holds.
  const mover = getUnitWithPlacementOnBoard(state.boardState, event.unit.unit);

  // The move opens with the commitment owed and the move unwritten: the
  // owner may commit a card first, and the card counts toward the move.
  const movement: MovementResolutionState = {
    commandResolutionType: 'movement',
    commitment: { commitmentType: 'pending' },
    completed: false,
    engagementState: 'pending',
    moveCommander: 'pending',
    movingUnit: mover,
    substepType: 'commandResolution',
    targetPlacement: 'pending',
  };

  const opened = openCommandResolution(
    updateRemainingUnitsForPlayer(state, event.player, stillToMove),
    movement,
  );
  return opened;
}
