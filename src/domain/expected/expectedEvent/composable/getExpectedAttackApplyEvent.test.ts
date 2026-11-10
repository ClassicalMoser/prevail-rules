import type { ExpectedGameEffect, ExpectedPlayerInput } from '@events';
import { createAttackApplyState as createPendingAttackApply } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
  createRetreatState,
  createReverseState,
  createRoutState,
  createTestUnit,
  placed,
  legalRetreatsOf,
} from '@testing';

import { getExpectedAttackApplyEvent } from './getExpectedAttackApplyEvent';

/**
 * GetExpectedAttackApplyEvent: next attack-apply step (melee/ranged) from attack-apply substate.
 */
describe('getExpectedAttackApplyEvent function', () => {
  function expectGameEffect(result: unknown, effectType: string) {
    expect((result as ExpectedGameEffect).effectType).toBe(effectType);
  }

  function expectPlayerChoice(
    result: unknown,
    playerSource: 'black' | 'white' | 'bothPlayers',
    choiceType: 'chooseRetreatOption' | 'chooseRoutDiscard',
  ) {
    expect((result as ExpectedPlayerInput).playerSource).toBe(playerSource);
    expect((result as ExpectedPlayerInput).choiceType).toBe(choiceType);
  }

  describe('openers for pending slots', () => {
    it('a fresh rout opens before it can resolve', () => {
      const unit = createTestUnit('white', { attack: 2 });
      // Factory leaves the rout pending; nothing is written yet.
      const attackApplyState = createPendingAttackApply(unit, {
        unitRetreated: true,
        unitReversed: true,
        unitRouted: true,
      });

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'openRoutFromAttackApply',
      );
    });

    it('a fresh retreat opens before the player is asked where to go', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createPendingAttackApply(unit, {
        unitRetreated: true,
        unitReversed: false,
        unitRouted: false,
      });

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'openRetreatFromAttackApply',
      );
    });

    it('a fresh reverse opens after any higher outcome is done', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createPendingAttackApply(unit, {
        unitRetreated: false,
        unitReversed: true,
        unitRouted: false,
      });

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'openReverseFromAttackApply',
      );
    });

    it('a unit hit past every threshold opens only its rout', () => {
      const unit = createTestUnit('white', { attack: 2 });
      // §7.5.3: a unit that routs ignores its own retreat and reverse, so the
      // factory leaves those two bypassed and only the rout is due.
      const attackApplyState = createPendingAttackApply(unit, {
        unitRetreated: true,
        unitReversed: true,
        unitRouted: true,
      });

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'openRoutFromAttackApply',
      );
    });
  });

  describe('rout priority', () => {
    it('a routed unit with its lower results bypassed resolves its rout', () => {
      const unit = createTestUnit('white', { attack: 2 });
      // §7.5.3: the rout is open and the retreat and reverse the same blow
      // reached are bypassed, so the rout is the only thing left to resolve.
      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRetreated: true,
          unitReversed: true,
          unitRouted: true,
        },
        retreatState: 'bypassed',
        reverseState: 'bypassed',
        routState: createRoutState('white', unit),
      });

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'resolveRout',
      );
    });

    it('given rout is completed, returns completeAttackApply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyStateWithRout(unit, {
        routState: createRoutState('white', unit, {
          cardsChosen: true,
          completed: true,
        }),
      });

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'completeAttackApply',
      );
    });

    it('given when rout is completed and attack apply is also completed, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyStateWithRout(unit, {
        completed: true,
        routState: createRoutState('white', unit, {
          cardsChosen: true,
          completed: true,
        }),
      });

      expect(() => getExpectedAttackApplyEvent(attackApplyState)).toThrow(
        'Attack apply state is already complete',
      );
    });
  });

  describe('retreat', () => {
    it('given retreat is not completed, returns expected retreat event', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      // A black unit behind on F-5 looks away, so the retreating unit has two
      // tied ways back and must be asked which to take (§9.1.3).
      const behind = placed(createTestUnit('black'), 'F-5', 'south');
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        legalRetreatsOf(unitPlacement, [behind]),
      );

      expectPlayerChoice(
        getExpectedAttackApplyEvent(attackApplyState),
        'white',
        'chooseRetreatOption',
      );
    });

    it('given continue to completeAttackApply when retreat is completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      // Open ground behind: the unit has one way back.
      const openGround = legalRetreatsOf(unitPlacement);
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        openGround,
        {
          // The retreat is finished, so only the attack's closing step is left.
          retreatState: createRetreatState(unitPlacement, openGround, {
            completed: true,
          }),
        },
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'completeAttackApply',
      );
    });
  });

  describe('reverse', () => {
    it('given reverse is not completed and unit can reverse, returns expected reverse event', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyStateWithReverse(
        unitPlacement.unit,
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'resolveReverse',
      );
    });

    it('given continue to completeAttackApply when reverse is completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyStateWithReverse(
        unitPlacement.unit,
        {
          reverseState: createReverseState(unitPlacement.unit, {
            completed: true,
            finalPosition: {
              coordinate: 'E-5',
              facing: 'south',
            },
          }),
        },
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'completeAttackApply',
      );
    });
  });

  describe('completion', () => {
    it('given all substeps are completed, returns completeAttackApply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      // Open ground behind: the unit has one way back.
      const openGround = legalRetreatsOf(unitPlacement);
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        openGround,
        {
          // The one retreat was taken and finished; nothing else is due.
          retreatState: createRetreatState(unitPlacement, openGround, {
            completed: true,
            chosenRetreatPath: ['step'],
          }),
        },
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'completeAttackApply',
      );
    });

    it('given when attack apply is already completed, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      // Open ground behind: the unit has one way back.
      const openGround = legalRetreatsOf(unitPlacement);
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        openGround,
        {
          // Both the retreat and the attack's own resolution are finished.
          completed: true,
          retreatState: createRetreatState(unitPlacement, openGround, {
            completed: true,
            chosenRetreatPath: ['step'],
          }),
        },
      );

      expect(() => getExpectedAttackApplyEvent(attackApplyState)).toThrow(
        'Attack apply state is already complete',
      );
    });
  });

  describe('error cases', () => {
    it('given when no results are reported, returns completeAttackApply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit);

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState),
        'completeAttackApply',
      );
    });

    it('given when no results and attack apply is already complete, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit, {
        completed: true,
      });

      expect(() => getExpectedAttackApplyEvent(attackApplyState)).toThrow(
        'Attack apply state is already complete',
      );
    });
  });
});
