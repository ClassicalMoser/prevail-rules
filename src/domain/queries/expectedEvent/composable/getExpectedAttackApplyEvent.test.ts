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
    it('should prioritize rout over retreat and reverse', () => {
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

    it('should return completeAttackApply when rout is completed', () => {
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

    it('should throw when rout is completed and attack apply is also completed', () => {
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
    it('should return expected retreat event when retreat is not completed', () => {
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

    it('should continue to completeAttackApply when retreat is completed', () => {
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
    it('should return expected reverse event when reverse is not completed and unit can reverse', () => {
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

    it('should return completeAttackApply when reverse cannot happen due to engagement', () => {
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

    it('should throw when reverse cannot happen and attack apply is already complete', () => {
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

    it('should continue to completeAttackApply when reverse is completed', () => {
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
    it('should return completeAttackApply when all substeps are completed', () => {
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

    it('should throw when attack apply is already completed', () => {
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
    it('should throw when no results are reported', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const attackApplyState = createAttackApplyState(unit);

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, createEmptyGameState()),
      ).toThrow('Attack apply state not initialized correctly');
    });

    it('should throw when results are reported but no substates are defined', () => {
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
