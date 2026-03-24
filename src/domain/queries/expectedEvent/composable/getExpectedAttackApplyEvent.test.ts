import type { StandardBoard, UnitWithPlacement } from '@entities';
import { expectedGameEffectSchema, expectedPlayerInputSchema } from '@entities';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createAttackApplyStateWithRout,
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createRetreatState,
  createReverseState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getExpectedAttackApplyEvent } from './getExpectedAttackApplyEvent';

const { canReverseUnitMock } = vi.hoisted(() => ({
  canReverseUnitMock: vi.fn(),
}));

vi.mock('@queries/sequencing', () => ({
  canReverseUnit: canReverseUnitMock,
}));

/**
 * getExpectedAttackApplyEvent: next attack-apply step (melee/ranged) from attack-apply substate.
 */
describe('getExpectedAttackApplyEvent', () => {
  beforeEach(() => {
    canReverseUnitMock.mockReset();
  });

  function expectGameEffect(result: unknown, effectType: string) {
    const parsed = expectedGameEffectSchema.safeParse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.effectType).toBe(effectType);
  }

  function expectPlayerChoice(
    result: unknown,
    playerSource: 'black' | 'white' | 'bothPlayers',
    choiceType: 'chooseRetreatOption' | 'chooseRoutDiscard',
  ) {
    const parsed = expectedPlayerInputSchema.safeParse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.playerSource).toBe(playerSource);
    expect(parsed.data?.choiceType).toBe(choiceType);
  }

  describe('rout priority', () => {
    it('given prioritize rout over retreat and reverse', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement: UnitWithPlacement<StandardBoard> = {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      };
      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: true,
          unitRetreated: true,
          unitReversed: true,
        },
        routState: createRoutState('white', unit),
        retreatState: createRetreatState(unitPlacement),
        reverseState: createReverseState(unitPlacement),
      });

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
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
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
        'completeAttackApply',
      );
    });

    it('given when rout is completed and attack apply is also completed, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyStateWithRout(unit, {
        routState: createRoutState('white', unit, {
          cardsChosen: true,
          completed: true,
        }),
        completed: true,
      });

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
      ).toThrow('Attack apply state is already complete');
    });
  });

  describe('retreat', () => {
    it('given retreat is not completed, returns expected retreat event', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyStateWithRetreat({
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      });

      expectPlayerChoice(
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
        'white',
        'chooseRetreatOption',
      );
    });

    it('given continue to completeAttackApply when retreat is completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement: UnitWithPlacement<StandardBoard> = {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      };
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        {
          retreatState: createRetreatState(unitPlacement, { completed: true }),
        },
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
        'completeAttackApply',
      );
    });
  });

  describe('reverse', () => {
    it('given reverse is not completed and unit can reverse, returns expected reverse event', () => {
      const unit = createTestUnit('white', { attack: 2 });
      canReverseUnitMock.mockReturnValue(true);
      const unitPlacement: UnitWithPlacement<StandardBoard> = {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      };
      const attackApplyState = createAttackApplyStateWithReverse(unitPlacement);

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
        'resolveReverse',
      );
    });

    it('given reverse cannot happen due to engagement, returns completeAttackApply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      canReverseUnitMock.mockReturnValue(false);
      const unitPlacement: UnitWithPlacement<StandardBoard> = {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      };
      const attackApplyState = createAttackApplyStateWithReverse(unitPlacement);
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
      const unitPlacement: UnitWithPlacement<StandardBoard> = {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      };
      const attackApplyState = createAttackApplyStateWithReverse(
        unitPlacement,
        {
          completed: true,
        },
      );

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
      ).toThrow('Attack apply state is already complete');
    });

    it('given continue to completeAttackApply when reverse is completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement: UnitWithPlacement<StandardBoard> = {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      };
      const attackApplyState = createAttackApplyStateWithReverse(
        unitPlacement,
        {
          reverseState: createReverseState(unitPlacement, {
            finalPosition: { coordinate: 'E-5', facing: 'south' },
            completed: true,
          }),
        },
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
        'completeAttackApply',
      );
    });
  });

  describe('completion', () => {
    it('given all substeps are completed, returns completeAttackApply', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement: UnitWithPlacement<StandardBoard> = {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      };
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        {
          retreatState: createRetreatState(unitPlacement, {
            finalPosition: { coordinate: 'E-4', facing: 'north' },
            completed: true,
          }),
        },
      );

      expectGameEffect(
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
        'completeAttackApply',
      );
    });

    it('given when attack apply is already completed, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const unitPlacement: UnitWithPlacement<StandardBoard> = {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      };
      const attackApplyState = createAttackApplyStateWithRetreat(
        unitPlacement,
        {
          retreatState: createRetreatState(unitPlacement, {
            finalPosition: { coordinate: 'E-4', facing: 'north' },
            completed: true,
          }),
          completed: true,
        },
      );

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
      ).toThrow('Attack apply state is already complete');
    });
  });

  describe('error cases', () => {
    it('given when no results are reported, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit);

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
      ).toThrow('Attack apply state not initialized correctly');
    });

    it('given when results are reported but no substates are defined, throws', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: true,
          unitRetreated: false,
          unitReversed: false,
        },
        routState: undefined,
      });

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
      ).toThrow('Attack apply state not initialized correctly');
    });
  });
});
