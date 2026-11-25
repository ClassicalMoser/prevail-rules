import { createEmptyGameState } from '@factories';
import { getMeleeRetreatState, getRangedAttackRetreatState } from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
  placed,
} from '@testing';

import { updateRetreatRoutState } from './updateRetreatRoutState';

/**
 * A unit that must retreat and cannot routs instead (§9.1.6), and the
 * retreat it could not make holds that rout until it is paid.
 */
describe('updateRetreatRoutState function', () => {
  const whiteUnit = createTestUnit('white', { attack: 2 });
  const blackSkirmishers = createTestUnit('black', { attack: 2 });

  it('writes a settled rout and leaves the retreat for settleRout to close', () => {
    // The writer records the rout only. Closing the retreat it settled
    // (§9.1.6) is settleRout's, so both ways of settling share it.
    // Black's skirmishers on C-5 shot white's unit and drove it back, but a
    // black unit stands right behind it, facing it, and cuts off its retreat
    // (§9.1.5): the rout is open inside the retreat.
    const struck = placed(whiteUnit, 'E-5', 'north');
    const cutter = enemyCuttingOffRetreat(struck);
    const shooter = placed(blackSkirmishers, 'C-5', 'south');
    const cutOff = legalRetreatsOf(struck, [cutter, shooter]);
    const retreat = createRetreatState(whiteUnit, cutOff, {
      routState: createRoutState('white', whiteUnit),
    });
    const board = createGameStateWithUnits([struck, cutter, shooter]);
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(board, {
        attackApplyState: createAttackApplyStateWithRetreat(whiteUnit, cutOff, {
          retreatState: retreat,
        }),
        attackingUnit: blackSkirmishers,
        defendingUnit: whiteUnit,
      }),
      board,
    );
    // A rout settled outright: no cards owed, so none are chosen.
    const settled = createRoutState('white', whiteUnit, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 0,
    });

    const newState = updateRetreatRoutState(shooting, settled);

    // Read the retreat back out of the ranged attack's apply: the rout inside
    // it is settled, and the retreat itself is still open.
    const after = getRangedAttackRetreatState(newState);
    expect(after.routState).toBe(settled);
    expect(after.completed).toBe(false);
  });

  it('in a melee, writes the rout inside the retreat of the side that could not fall back', () => {
    // Black holds the initiative. Its blow drove white's unit back against
    // the board's south edge, so white's retreat holds an open rout; white's
    // blow reached nothing.
    const atTheEdge = legalRetreatsOf(placed(whiteUnit, 'L-5', 'north'));
    const retreat = createRetreatState(whiteUnit, atTheEdge, {
      routState: createRoutState('white', whiteUnit),
    });
    const fighting = createGameStateResolvingMelee(
      createMeleeResolutionState(createEmptyGameState('standard'), {
        attackOnFirstPlayerApplyState:
          createAttackApplyStateWithNothingDue(blackSkirmishers),
        attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
          whiteUnit,
          atTheEdge,
          { retreatState: retreat },
        ),
      }),
      'black',
    );

    // The cost of the rout is worked out: two cards.
    const priced = createRoutState('white', whiteUnit, { numberToDiscard: 2 });
    const newState = updateRetreatRoutState(fighting, priced);

    // White's retreat holds the priced rout.
    expect(getMeleeRetreatState(newState, 'white').routState).toBe(priced);
  });
});
