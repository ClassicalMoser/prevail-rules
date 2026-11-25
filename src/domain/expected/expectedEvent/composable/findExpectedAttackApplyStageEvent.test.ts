import type { AttackResult } from '@entities';
import { createAttackApplyState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createRetreatState,
  createReverseState,
  createRoutState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';

import { findExpectedAttackApplyStageEvent } from './findExpectedAttackApplyStageEvent';

/**
 * An attack's results are carried out a stage at a time: retreat, then
 * reverse, then rout (§7.5.2). Asked about one stage for one unit, this says
 * what that stage still waits on, or nothing when the unit has nothing due in
 * it, so the sequencer can pass over it.
 */
describe('findExpectedAttackApplyStageEvent function', () => {
  // The struck unit: black, on E-5 facing north, with open ground behind.
  const struck = createUnitWithPlacement();
  const openGround = legalRetreatsOf(struck);
  // An attack that reached all three thresholds, so every stage is due.
  const everyThreshold: AttackResult = {
    unitRetreated: true,
    unitReversed: true,
    unitRouted: true,
  };
  // The attack as it is measured: every result due, none opened yet.
  const allDue = createAttackApplyState(struck.unit, everyThreshold);

  describe('a due stage opens before anything is asked in it', () => {
    it('opens the retreat', () => {
      expect(
        findExpectedAttackApplyStageEvent(allDue, 'retreat'),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openRetreatFromAttackApply',
      });
    });

    it('opens the reverse', () => {
      expect(
        findExpectedAttackApplyStageEvent(allDue, 'reverse'),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openReverseFromAttackApply',
      });
    });

    it('opens the rout', () => {
      expect(findExpectedAttackApplyStageEvent(allDue, 'rout')).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openRoutFromAttackApply',
      });
    });
  });

  describe('an open stage asks for its own next step', () => {
    // Each stage as it stands once carried out.
    const retreated = createRetreatState(struck.unit, openGround, {
      completed: true,
    });
    const reversed = createReverseState(struck.unit, { completed: true });

    it('moves the retreating unit along its one way back', () => {
      // The retreat is open; one way back is taken as it opens, so the unit
      // only has to move.
      const retreating = {
        ...allDue,
        retreatState: createRetreatState(struck.unit, openGround),
      };

      expect(
        findExpectedAttackApplyStageEvent(retreating, 'retreat'),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'resolveRetreat',
      });
    });

    it('turns the reversing unit about', () => {
      // The unit has fallen back, and its reverse is open.
      const reversing = {
        ...allDue,
        retreatState: retreated,
        reverseState: createReverseState(struck.unit),
      };

      expect(
        findExpectedAttackApplyStageEvent(reversing, 'reverse'),
      ).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'resolveReverse',
      });
    });

    it('counts the Morale the rout costs', () => {
      // The unit has fallen back and turned about, and its rout is open.
      const routing = {
        ...allDue,
        retreatState: retreated,
        reverseState: reversed,
        routState: createRoutState('black', struck.unit),
      };

      expect(findExpectedAttackApplyStageEvent(routing, 'rout')).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'resolveRout',
      });
    });
  });

  describe('a stage with nothing due answers undefined', () => {
    it.each(['retreat', 'reverse', 'rout'] as const)(
      'the %s of an attack that reached no threshold',
      (stage) => {
        // Every result bypassed: the unit stood untouched.
        const unhit = createAttackApplyStateWithNothingDue(struck.unit);

        expect(findExpectedAttackApplyStageEvent(unhit, stage)).toBeUndefined();
      },
    );

    it.each(['retreat', 'reverse', 'rout'] as const)(
      'the %s once it is finished',
      (stage) => {
        // Each stage carried out in full.
        const allDone = {
          ...allDue,
          retreatState: createRetreatState(struck.unit, openGround, {
            completed: true,
          }),
          reverseState: createReverseState(struck.unit, { completed: true }),
          routState: createRoutState('black', struck.unit, {
            cardsChosen: true,
            completed: true,
            numberToDiscard: 1,
          }),
        };

        expect(
          findExpectedAttackApplyStageEvent(allDone, stage),
        ).toBeUndefined();
      },
    );
  });

  it('refuses a stage outside the three, by name', () => {
    // A stage the type forbids, to reach the refusal.
    const charge = 'charge' as never;

    expect(() => findExpectedAttackApplyStageEvent(allDue, charge)).toThrow(
      'Unknown attack apply stage: charge',
    );
  });
});
