import type { ChooseShooterEvent } from '@events';
import type {
  GameState,
  IssueCommandsPhaseState,
  RangedAttackResolutionState,
} from '@game';
import { getIssueCommandsPhaseState, isSameUnitInstance } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

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
  const phaseState = getIssueCommandsPhaseState(state);

  // The order is carried out shot by shot; this unit's is now under way.
  const isFirstPlayer = event.player === state.currentInitiative;
  const remaining = isFirstPlayer
    ? phaseState.remainingUnitsFirstPlayer
    : phaseState.remainingUnitsSecondPlayer;
  const stillToAct = remaining.filter(
    (unit) => !isSameUnitInstance(unit, event.unit.unit).result,
  );

  // The shot opens with the shooter's commitment owed and nothing yet aimed:
  // its owner may commit a card first, and a Range card reaches further
  // when the target is chosen (§4.3.11 step 2).
  const shot: RangedAttackResolutionState = {
    attackApplyState: 'pending',
    attackingCommitment: { commitmentType: 'pending' },
    attackingUnit: event.unit.unit,
    commandResolutionType: 'rangedAttack',
    completed: false,
    defendingCommitment: { commitmentType: 'pending' },
    defendingUnit: 'pending',
    substepType: 'commandResolution',
    supportingUnits: 'pending',
  };

  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: shot,
    remainingUnitsFirstPlayer: isFirstPlayer
      ? stillToAct
      : phaseState.remainingUnitsFirstPlayer,
    remainingUnitsSecondPlayer: isFirstPlayer
      ? phaseState.remainingUnitsSecondPlayer
      : stillToAct,
  };
  const opened = updatePhaseState(state, newPhaseState);
  return opened;
}
