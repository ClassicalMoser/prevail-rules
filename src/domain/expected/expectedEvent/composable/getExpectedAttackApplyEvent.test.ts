import type { ExpectedGameEffect, ExpectedPlayerInput } from '@events';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
  createGameStateWithEngagedUnits,
  createRetreatState,
  createReverseState,
  createRoutState,
  createTestUnit,
  placed,
} from '@testing';

import { getExpectedAttackApplyEvent } from './getExpectedAttackApplyEvent';

import { createEmptyGameState } from '@factories';

const { canReverseUnitMock } = vi.hoisted(() => ({
  canReverseUnitMock: vi.fn(),
}));

vi.mock(import('@legality'), () => ({
  canReverseUnit: canReverseUnitMock,
}));

/**
 * GetExpectedAttackApplyEvent: next attack-apply step (melee/ranged) from attack-apply substate.
 */
describe('getExpectedAttackApplyEvent function', () => {
  beforeEach(() => {
    canReverseUnitMock.mockReset();
  });

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

  describe('rout priority', () => {
    it('given prioritize rout over retreat and reverse', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRetreated: true,
          unitReversed: true,
          unitRouted: true,
        },
        retreatState: createRetreatState(unitPlacement),
        reverseState: createReverseState(unitPlacement.unit),
        routState: createRoutState('white', unit),
      });

      expectGameEffect(
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
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
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
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

      expect(() =>
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
      ).toThrow('Attack apply state is already complete');
    });
  });

  describe('retreat', () => {
    it('given retreat is not completed, returns expected retreat event', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyStateWithRetreat(
        placed(unit, 'E-5', 'north'),
      );

      expectPlayerChoice(
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
        'white',
        'chooseRetreatOption',
      );
    });

    it('given continue to completeAttackApply when retreat is completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        {
          retreatState: createRetreatState(unitPlacement, { completed: true }),
        },
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
        'completeAttackApply',
      );
    });
  });

  describe('reverse', () => {
    it('given reverse is not completed and unit can reverse, returns expected reverse event', () => {
      const unit = createTestUnit('white', { attack: 2 });
      canReverseUnitMock.mockReturnValue(true);
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyStateWithReverse(
        unitPlacement.unit,
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
        'resolveReverse',
      );
    });

    it('given reverse cannot happen due to engagement, returns completeAttackApply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      canReverseUnitMock.mockReturnValue(false);
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyStateWithReverse(
        unitPlacement.unit,
      );
      const gameState = createGameStateWithEngagedUnits(
        unit,
        createTestUnit('black', { attack: 2 }),
        'E-5',
        'north',
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState, gameState),
        'completeAttackApply',
      );
    });

    it('given when reverse cannot happen and attack apply is already complete, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      canReverseUnitMock.mockReturnValue(false);
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyStateWithReverse(
        unitPlacement.unit,
        {
          completed: true,
        },
      );

      expect(() =>
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
      ).toThrow('Attack apply state is already complete');
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
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
        'completeAttackApply',
      );
    });
  });

  describe('completion', () => {
    it('given all substeps are completed, returns completeAttackApply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        {
          retreatState: createRetreatState(unitPlacement, {
            completed: true,
            finalPosition: {
              coordinate: 'E-4',
              facing: 'north',
            },
          }),
        },
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
        'completeAttackApply',
      );
    });

    it('given when attack apply is already completed, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement = placed(unit, 'E-5', 'north');
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        {
          completed: true,
          retreatState: createRetreatState(unitPlacement, {
            completed: true,
            finalPosition: {
              coordinate: 'E-4',
              facing: 'north',
            },
          }),
        },
      );

      expect(() =>
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
      ).toThrow('Attack apply state is already complete');
    });
  });

  describe('error cases', () => {
    it('given when no results are reported, returns completeAttackApply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit);

      expectGameEffect(
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
        'completeAttackApply',
      );
    });

    it('given when no results and attack apply is already complete, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit, {
        completed: true,
      });

      expect(() =>
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
      ).toThrow('Attack apply state is already complete');
    });

    it('throws when a result is claimed and no outcome was opened', () => {
      const unit = createTestUnit('white', { attack: 2 });
      // The game cannot reach this: an attack that routs opens its rout and
      // bypasses the rest. Every slot is overridden by hand to leave the apply
      // claiming a rout with nothing written anywhere, which is the one state
      // this guard exists to reject.
      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRetreated: false,
          unitReversed: false,
          unitRouted: true,
        },
        retreatState: 'pending' as const,
        reverseState: 'pending' as const,
        routState: 'pending' as const,
      });

      expect(() =>
        getExpectedAttackApplyEvent(
          attackApplyState,
          createEmptyGameState('standard'),
        ),
      ).toThrow('Attack apply state not initialized correctly');
    });
  });
});
