import type { ChooseMovingUnitEvent } from '@events';
import type {
  GameState,
  IssueCommandsPhaseState,
  MovementResolutionState,
} from '@game';
import { getIssueCommandsPhaseState, isSameUnitInstance } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

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
  const phaseState = getIssueCommandsPhaseState(state);

  // The order is carried out unit by unit; this one is now under way.
  const isFirstPlayer = event.player === state.currentInitiative;
  const remaining = isFirstPlayer
    ? phaseState.remainingUnitsFirstPlayer
    : phaseState.remainingUnitsSecondPlayer;
  const stillToMove = remaining.filter(
    (unit) => !isSameUnitInstance(unit, event.unit.unit).result,
  );

  // The move opens with the commitment owed and the move unwritten: the
  // owner may commit a card first, and the card counts toward the move.
  const movement: MovementResolutionState = {
    commandResolutionType: 'movement',
    commitment: { commitmentType: 'pending' },
    completed: false,
    engagementState: 'pending',
    moveCommander: 'pending',
    movingUnit: event.unit,
    substepType: 'commandResolution',
    targetPlacement: 'pending',
  };

  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: movement,
    remainingUnitsFirstPlayer: isFirstPlayer
      ? stillToMove
      : phaseState.remainingUnitsFirstPlayer,
    remainingUnitsSecondPlayer: isFirstPlayer
      ? phaseState.remainingUnitsSecondPlayer
      : stillToMove,
  };
  const opened = updatePhaseState(state, newPhaseState);
  return opened;
}
