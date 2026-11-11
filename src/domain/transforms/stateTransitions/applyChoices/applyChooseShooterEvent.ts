import type { ChooseShooterEvent } from '@events';
import type { GameState, RangedAttackResolutionState } from '@game';
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
 * Applies a ChooseShooterEvent: the named unit's shot begins (§4.3.11).
 * A ranged attack opens for it with its owner's commitment still to come,
 * and its target, its supporters and the target's commitment not yet known;
 * and the unit leaves the list of those the order has still to act, since
 * each shoots once.
 *
 * Event is assumed pre-validated (the unit is one the order may shoot with next).
 */
export function applyChooseShooterEvent<S extends GameState>(
  event: ChooseShooterEvent,
  state: S,
): S {
  // The order is carried out shot by shot; this unit's is now under way.
  const remaining = getRemainingUnitsForPlayer(state, event.player);
  const stillToAct = arrayWithoutUnit(remaining, event.unit.unit);

  // The event names the shooter by who it is; the unit that shoots, with the
  // stats it carries, is the one the board holds.
  const shooter = getUnitWithPlacementOnBoard(
    state.boardState,
    event.unit.unit,
  ).unit;

  // The shot opens with the shooter's commitment owed and nothing yet aimed:
  // its owner may commit a card first, and a Range card reaches further
  // when the target is chosen (§4.3.11 step 2).
  const shot: RangedAttackResolutionState = {
    attackApplyState: 'pending',
    attackingCommitment: { commitmentType: 'pending' },
    attackingUnit: shooter,
    commandResolutionType: 'rangedAttack',
    completed: false,
    defendingCommitment: { commitmentType: 'pending' },
    defendingUnit: 'pending',
    substepType: 'commandResolution',
    supportingUnits: 'pending',
  };

  const opened = openCommandResolution(
    updateRemainingUnitsForPlayer(state, event.player, stillToAct),
    shot,
  );
  return opened;
}
