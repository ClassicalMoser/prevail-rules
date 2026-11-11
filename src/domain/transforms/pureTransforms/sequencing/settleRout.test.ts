import type { RoutState } from '@game';
import {
  findRearEngagementStateFromMovement,
  getIssueCommandsPhaseState,
  getRetreatStateFromAttackApply,
} from '@queries';
import { throwIfBypassed, throwIfNone, throwIfPending } from '@utils';
import {
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRallyResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestCard,
  createTestUnit,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
  placed,
} from '@testing';
import { createEmptyGameState } from '@factories';
import { addUnitToBoard } from '../units/addUnitToBoard';
import { updateCurrentInitiative } from '../state/updateCurrentInitiative';
import { updatePhaseState } from '../state/updatePhaseState';
import { settleRout } from './settleRout';

/**
 * SettleRout: records a rout and, once it is settled, closes what it was
 * holding open: a retreat, a rear engagement or a rally. An attack's result
 * stays open for completeAttackApply.
 */
describe('settleRout function', () => {
  const unit = createTestUnit('white', { attack: 2 });

  /** The rout paid in full: cards chosen, nothing left owed. */
  const paid: RoutState = createRoutState('white', unit, {
    cardsChosen: true,
    completed: true,
    numberToDiscard: 2,
  });

  /** A unit moving into white's rear, whose rout is open and unpaid. */
  function createStateWithRearRout() {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const movement = createMovementResolutionState(state, {
      engagementState: createRearEngagementState({
        routState: createRoutState('white', unit),
      }),
    });
    return updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );
  }

  /** A shot that drove white's unit back against an enemy, so it routs. */
  function createStateWithRetreatRout() {
    const state = createEmptyGameState('standard');
    const placement = placed(unit, 'E-5', 'north');
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const retreatState = createRetreatState(
      placement,
      legalRetreatsOf(placement, [enemyCuttingOffRetreat(placement)]),
      { routState: createRoutState('white', unit) },
    );
    const attackApply = createAttackApplyStateWithRetreat(
      placement,
      legalRetreatsOf(placement),
      { retreatState },
    );
    return updatePhaseState(
      stateWithUnit,
      createIssueCommandsPhaseState(stateWithUnit, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          stateWithUnit,
          { attackApplyState: attackApply },
        ),
      }),
    );
  }

  /** A shot whose result routed white's unit outright. */
  function createStateWithRangedRout() {
    const state = createEmptyGameState('standard');
    const placement = placed(unit, 'E-5', 'north');
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    return updatePhaseState(
      stateWithUnit,
      createIssueCommandsPhaseState(stateWithUnit, {
        currentCommandResolutionState: createRangedAttackResolutionState(
          stateWithUnit,
          { attackApplyState: createAttackApplyStateWithRout(unit) },
        ),
      }),
    );
  }

  /** White, with the initiative, routing the units its rally could not cover. */
  function createStateWithRallyRout() {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const rallyState = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: createRoutState('white', unit),
      unitsLostSupport: [unit],
    });
    return updatePhaseState(
      state,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rallyState,
        step: 'firstPlayerResolveRally',
      }),
    );
  }

  it('ends a rear engagement when its rout is paid, since the rout is all it was', () => {
    const settled = settleRout(createStateWithRearRout(), paid);

    // The rear engagement is done, and so is its slot in the movement.
    const rear = findRearEngagementStateFromMovement(settled);
    expect(rear?.engagementResolutionState.completed).toBe(true);
  });

  it('leaves a rear engagement open while its rout is still owed', () => {
    const owed = createRoutState('white', unit, { numberToDiscard: 2 });

    const written = settleRout(createStateWithRearRout(), owed);

    // The cards are not discarded yet, so the engagement waits.
    const rear = findRearEngagementStateFromMovement(written);
    expect(rear?.engagementResolutionState.completed).toBe(false);
    expect(rear?.engagementResolutionState.routState.numberToDiscard).toBe(2);
  });

  it('ends a retreat that fell into a rout once the rout is settled', () => {
    // Nothing to pay: the rout settles as it is resolved, and the unit has
    // left, so the retreat has nothing left to do (§9.1.6).
    const outright = createRoutState('white', unit, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 0,
    });

    const settled = settleRout(createStateWithRetreatRout(), outright);

    // Read the retreat back off the shot's result.
    const command = throwIfPending(
      getIssueCommandsPhaseState(settled).currentCommandResolutionState,
      'command',
    );
    if (command.commandResolutionType !== 'rangedAttack') {
      throw new Error('type');
    }
    const apply = throwIfPending(command.attackApplyState, 'attack apply');
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(apply),
      'the attack applies a retreat',
    );
    expect(retreat.completed).toBe(true);
  });

  it('ends a rally and moves cleanup on once the rally’s rout is paid', () => {
    const settled = settleRout(createStateWithRallyRout(), paid);

    const phase = throwIfNone(
      settled.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== 'cleanup') {
      throw new Error('phase');
    }
    // White rallied first, so black's rally comes next.
    expect(phase.step).toBe('secondPlayerChooseRally');
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(rally.completed).toBe(true);
  });

  it('leaves a shot’s result open after its rout is paid, for completeAttackApply', () => {
    const settled = settleRout(createStateWithRangedRout(), paid);

    // The rout is recorded, and the shot's result is still there to close.
    const command = throwIfPending(
      getIssueCommandsPhaseState(settled).currentCommandResolutionState,
      'command',
    );
    if (command.commandResolutionType !== 'rangedAttack') {
      throw new Error('type');
    }
    const apply = throwIfPending(command.attackApplyState, 'attack apply');
    const rout = throwIfBypassed(
      throwIfPending(apply.routState, 'rout'),
      'the rout was opened',
    );
    expect(rout.completed).toBe(true);
    expect(apply.completed).toBe(false);
  });

  it('throws when the player named on the rout is not routing', () => {
    // Nothing in play holds a rout for white to settle.
    const state = createEmptyGameState('standard');

    expect(() => settleRout(state, paid)).toThrow(
      'No rout to settle for white',
    );
  });
});
