import type { RoutState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  findRearEngagementStateFromMovement,
  getCleanupPhaseState,
  getMeleeAttackApplyState,
  getRangedAttackApplyState,
  getRangedAttackRetreatState,
} from '@queries';
import { throwIfPending } from '@utils';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRout,
  createCleanupPhaseStateWithRallyRout,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
  placed,
} from '@testing';
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
  const blackUnit = createTestUnit('black', { attack: 2 });

  /** The rout paid in full: cards chosen, nothing left owed. */
  const paid: RoutState = createRoutState('white', unit, {
    cardsChosen: true,
    completed: true,
    numberToDiscard: 2,
  });

  /** A unit moving into white's rear, whose rout is open and unpaid. */
  const caughtFromBehind = createGameStateMovingInto(
    createRearEngagementState({ routState: createRoutState('white', unit) }),
  );

  it('ends a rear engagement when its rout is paid, since the rout is all it was', () => {
    const settled = settleRout(caughtFromBehind, paid);

    // The rear engagement is done, and so is its slot in the movement.
    const rear = findRearEngagementStateFromMovement(settled);
    expect(rear?.engagementResolutionState.completed).toBe(true);
    expect(rear?.completed).toBe(true);
  });

  it('leaves a rear engagement open while its rout is still owed', () => {
    const owed = createRoutState('white', unit, { numberToDiscard: 2 });

    const written = settleRout(caughtFromBehind, owed);

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
    // A shot that drove white's unit back against an enemy, so it routs:
    // black's skirmishers on C-5 shot it, and a black unit right behind it,
    // facing it, cuts off its retreat (§9.1.5).
    const struck = placed(unit, 'E-5', 'north');
    const cutter = enemyCuttingOffRetreat(struck);
    const shooter = placed(blackUnit, 'C-5', 'south');
    const cutOff = legalRetreatsOf(struck, [cutter, shooter]);
    const board = createGameStateWithUnits([struck, cutter, shooter]);
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(board, {
        attackApplyState: createAttackApplyStateWithRetreat(unit, cutOff, {
          retreatState: createRetreatState(unit, cutOff, {
            routState: createRoutState('white', unit),
          }),
        }),
        attackingUnit: blackUnit,
        defendingUnit: unit,
      }),
      board,
    );

    const settled = settleRout(shooting, outright);

    // Read the retreat back off the shot's result.
    expect(getRangedAttackRetreatState(settled).completed).toBe(true);
  });

  it('ends a rally and moves cleanup on once the rally’s rout is paid', () => {
    // White, with the initiative, routing the units its rally could not cover.
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const rallying = updatePhaseState(
      base,
      createCleanupPhaseStateWithRallyRout(
        base,
        createRoutState('white', unit),
      ),
    );

    const phase = getCleanupPhaseState(settleRout(rallying, paid));

    // White rallied first, so black's rally comes next.
    expect(phase.step).toBe('secondPlayerChooseRally');
    const rally = throwIfPending(
      phase.firstPlayerRallyResolutionState,
      'rally',
    );
    expect(rally.completed).toBe(true);
  });

  it('leaves a shot’s result open after its rout is paid, for completeAttackApply', () => {
    // A shot whose result routed white's unit outright.
    const empty = createEmptyGameState('standard');
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty, {
        attackApplyState: createAttackApplyStateWithRout(unit),
      }),
      empty,
    );

    const settled = settleRout(shooting, paid);

    // The rout is recorded, and the shot's result is still there to close.
    const apply = getRangedAttackApplyState(settled);
    expect(apply.routState).toBe(paid);
    expect(apply.completed).toBe(false);
  });

  it('leaves a melee side’s result open after its rout is paid, since both sides must finish first', () => {
    // Black holds the initiative; its blow routed white's unit, and white's
    // reached nothing.
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState:
          createAttackApplyStateWithNothingDue(blackUnit),
        attackOnSecondPlayerApplyState: createAttackApplyStateWithRout(unit),
      }),
      'black',
    );

    const settled = settleRout(fighting, paid);

    // White's side records the paid rout and stays open for
    // completeAttackApply (§7.5.6).
    const apply = getMeleeAttackApplyState(settled, 'white');
    expect(apply.routState).toBe(paid);
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
