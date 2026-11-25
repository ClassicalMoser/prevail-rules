import type { AttackResult } from '@entities';
import { createAttackApplyState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createRetreatState,
  createReverseState,
  createRoutState,
  createTestUnit,
  legalRetreatsOf,
  placed,
} from '@testing';

import { getExpectedAttackApplyEvent } from './getExpectedAttackApplyEvent';

/**
 * GetExpectedAttackApplyEvent: next attack-apply step (melee/ranged) from attack-apply substate.
 */
describe('getExpectedAttackApplyEvent function', () => {
  // The struck unit: white, on E-5 facing north.
  const unit = createTestUnit('white', { attack: 2 });
  const unitPlacement = placed(unit, 'E-5', 'north');
  // Open ground behind: the unit has one way back.
  const openGround = legalRetreatsOf(unitPlacement);
  // An attack that reached all three thresholds.
  const everyThreshold: AttackResult = {
    unitRetreated: true,
    unitReversed: true,
    unitRouted: true,
  };

  describe('results are carried out a stage at a time, in order (§7.5.2)', () => {
    it('a unit hit past every threshold falls back first', () => {
      // §7.5.2: every result is carried out in its place, so a unit that will
      // rout still falls back and turns about first.
      const attackApplyState = createAttackApplyState(unit, everyThreshold);

      expect(getExpectedAttackApplyEvent(attackApplyState)).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openRetreatFromAttackApply',
      });
    });

    it('turns about once it has fallen back', () => {
      // The retreat is finished; the reverse is due and not yet open.
      const attackApplyState = {
        ...createAttackApplyState(unit, everyThreshold),
        retreatState: createRetreatState(unit, openGround, { completed: true }),
      };

      expect(getExpectedAttackApplyEvent(attackApplyState)).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openReverseFromAttackApply',
      });
    });

    it('routs last, once it has fallen back and turned about', () => {
      // The retreat and the reverse are finished; the rout is due.
      const attackApplyState = {
        ...createAttackApplyState(unit, everyThreshold),
        retreatState: createRetreatState(unit, openGround, { completed: true }),
        reverseState: createReverseState(unit, { completed: true }),
      };

      expect(getExpectedAttackApplyEvent(attackApplyState)).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'openRoutFromAttackApply',
      });
    });

    it('asks an open stage for its own next step', () => {
      // A black unit behind on F-5 looks away, so the retreating unit has two
      // tied ways back and must be asked which to take (§9.1.3).
      const behind = placed(createTestUnit('black'), 'F-5', 'south');
      const attackApplyState = createAttackApplyStateWithRetreat(
        unit,
        legalRetreatsOf(unitPlacement, [behind]),
      );

      // The struck unit's owner chooses.
      expect(getExpectedAttackApplyEvent(attackApplyState)).toStrictEqual({
        actionType: 'playerChoice',
        choiceType: 'chooseRetreatOption',
        playerSource: 'white',
      });
    });
  });

  describe('with nothing left due, the apply closes', () => {
    it('after every result has been carried out', () => {
      // Fallen back, turned about and routed, the rout paid.
      const attackApplyState = {
        ...createAttackApplyState(unit, everyThreshold),
        retreatState: createRetreatState(unit, openGround, { completed: true }),
        reverseState: createReverseState(unit, { completed: true }),
        routState: createRoutState('white', unit, {
          cardsChosen: true,
          completed: true,
          numberToDiscard: 1,
        }),
      };

      expect(getExpectedAttackApplyEvent(attackApplyState)).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'completeAttackApply',
      });
    });

    it('after an attack that reached no threshold, which is common in melee', () => {
      // Every result bypassed: the unit stood untouched.
      const attackApplyState = createAttackApplyStateWithNothingDue(unit);

      expect(getExpectedAttackApplyEvent(attackApplyState)).toStrictEqual({
        actionType: 'gameEffect',
        effectType: 'completeAttackApply',
      });
    });

    it('but a closed apply has nothing left to close, so asking throws', () => {
      // The apply has already been closed.
      const attackApplyState = createAttackApplyStateWithNothingDue(unit, {
        completed: true,
      });

      expect(() => getExpectedAttackApplyEvent(attackApplyState)).toThrow(
        'Attack apply state is already complete',
      );
    });
  });
});
