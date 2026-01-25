import type { AttackApplyState, RoutState, StandardBoard } from '@entities';
import { expectedGameEffectSchema, expectedPlayerInputSchema } from '@entities';
import {
  createAttackApplyState,
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
} from '@testing';
import { addUnitToBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getExpectedAttackApplyEvent } from './getExpectedAttackApplyEvent';

describe('getExpectedAttackApplyEvent', () => {
  describe('rout priority', () => {
    it('should prioritize rout over retreat and reverse', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const routState: RoutState = {
        substepType: 'rout',
        player: 'white',
        unitsToRout: new Set([unit]),
        numberToDiscard: undefined,
        cardsChosen: false,
        completed: false,
      };

      const attackApplyState: AttackApplyState<StandardBoard> = {
        substepType: 'attackApply',
        defendingUnit: unit,
        attackResult: {
          unitRouted: true,
          unitRetreated: true,
          unitReversed: true,
        },
        routState,
        retreatState: {
          substepType: 'retreat',
          retreatingUnit: {
            unit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          legalRetreatOptions: new Set(),
          finalPosition: undefined,
          routState: undefined,
          completed: false,
        },
        reverseState: {
          substepType: 'reverse',
          reversingUnit: {
            unit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          finalPosition: undefined,
          completed: false,
        },
        completed: false,
      };

      const result = getExpectedAttackApplyEvent(attackApplyState, gameState);
      expect(result.actionType).toBe('gameEffect');
      const resultIsExpectedGameEffect =
        expectedGameEffectSchema.safeParse(result);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe('resolveRout');
    });

    it('should return completeAttackApply when rout is completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const routState: RoutState = {
        substepType: 'rout',
        player: 'white',
        unitsToRout: new Set([unit]),
        numberToDiscard: 1,
        cardsChosen: true,
        completed: true,
      };

      const attackApplyState: AttackApplyState<StandardBoard> = {
        substepType: 'attackApply',
        defendingUnit: unit,
        attackResult: {
          unitRouted: true,
          unitRetreated: false,
          unitReversed: false,
        },
        routState,
        retreatState: undefined,
        reverseState: undefined,
        completed: false,
      };

      const result = getExpectedAttackApplyEvent(attackApplyState, gameState);
      expect(result.actionType).toBe('gameEffect');
      const resultIsExpectedGameEffect =
        expectedGameEffectSchema.safeParse(result);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe(
        'completeAttackApply',
      );
    });

    it('should throw error when rout is completed and attack apply is also completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const routState: RoutState = {
        substepType: 'rout',
        player: 'white',
        unitsToRout: new Set([unit]),
        numberToDiscard: 1,
        cardsChosen: true,
        completed: true,
      };

      const attackApplyState: AttackApplyState<StandardBoard> = {
        substepType: 'attackApply',
        defendingUnit: unit,
        attackResult: {
          unitRouted: true,
          unitRetreated: false,
          unitReversed: false,
        },
        routState,
        retreatState: undefined,
        reverseState: undefined,
        completed: true,
      };

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, gameState),
      ).toThrow('Attack apply state is already complete');
    });
  });

  describe('retreat', () => {
    it('should return expected retreat event when retreat is not completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: false,
          unitRetreated: true,
          unitReversed: false,
        },
        retreatState: {
          substepType: 'retreat',
          retreatingUnit: {
            unit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          legalRetreatOptions: new Set([
            { coordinate: 'E-4', facing: 'north' },
            { coordinate: 'E-6', facing: 'north' },
          ]),
          finalPosition: undefined,
          routState: undefined,
          completed: false,
        },
        completed: false,
      });

      const result = getExpectedAttackApplyEvent(attackApplyState, gameState);
      expect(result.actionType).toBe('playerChoice');
      const resultIsExpectedPlayerInput =
        expectedPlayerInputSchema.safeParse(result);
      expect(resultIsExpectedPlayerInput.success).toBe(true);
      expect(resultIsExpectedPlayerInput.data?.choiceType).toBe(
        'chooseRetreatOption',
      );
      expect(resultIsExpectedPlayerInput.data?.playerSource).toBe('white');
    });

    it('should continue to completeAttackApply when retreat is completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: false,
          unitRetreated: true,
          unitReversed: false,
        },
        retreatState: {
          substepType: 'retreat',
          retreatingUnit: {
            unit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          legalRetreatOptions: new Set([]),
          finalPosition: undefined,
          routState: undefined,
          completed: true,
        },
        completed: false,
      });

      const result = getExpectedAttackApplyEvent(attackApplyState, gameState);
      expect(result.actionType).toBe('gameEffect');
      const resultIsExpectedGameEffect =
        expectedGameEffectSchema.safeParse(result);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe(
        'completeAttackApply',
      );
    });
  });

  describe('reverse', () => {
    it('should return expected reverse event when reverse is not completed and unit can reverse', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();
      const stateWithUnit = {
        ...gameState,
        boardState: addUnitToBoard(gameState.boardState, {
          unit,
          placement: { coordinate: 'E-5', facing: 'north' },
        }),
      };

      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: false,
          unitRetreated: false,
          unitReversed: true,
        },
        reverseState: {
          substepType: 'reverse',
          reversingUnit: {
            unit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          finalPosition: undefined,
          completed: false,
        },
        completed: false,
      });

      const result = getExpectedAttackApplyEvent(
        attackApplyState,
        stateWithUnit,
      );
      expect(result.actionType).toBe('gameEffect');
      const resultIsExpectedGameEffect =
        expectedGameEffectSchema.safeParse(result);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe(
        'resolveReverse',
      );
    });

    it('should return completeAttackApply when reverse cannot happen due to engagement', () => {
      const primaryUnit = createTestUnit('white', { attack: 2 });
      const secondaryUnit = createTestUnit('black', { attack: 2 });
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'E-5',
        'north',
      );

      const attackApplyState = createAttackApplyState(primaryUnit, {
        attackResult: {
          unitRouted: false,
          unitRetreated: false,
          unitReversed: true,
        },
        reverseState: {
          substepType: 'reverse',
          reversingUnit: {
            unit: primaryUnit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          finalPosition: undefined,
          completed: false,
        },
        completed: false,
      });

      const result = getExpectedAttackApplyEvent(attackApplyState, gameState);
      expect(result.actionType).toBe('gameEffect');
      const resultIsExpectedGameEffect =
        expectedGameEffectSchema.safeParse(result);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe(
        'completeAttackApply',
      );
    });

    it('should continue to completeAttackApply when reverse is completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();
      const stateWithUnit = {
        ...gameState,
        boardState: addUnitToBoard(gameState.boardState, {
          unit,
          placement: { coordinate: 'E-5', facing: 'north' },
        }),
      };

      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: false,
          unitRetreated: false,
          unitReversed: true,
        },
        reverseState: {
          substepType: 'reverse',
          reversingUnit: {
            unit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          finalPosition: { coordinate: 'E-5', facing: 'south' },
          completed: true,
        },
        completed: false,
      });

      const result = getExpectedAttackApplyEvent(
        attackApplyState,
        stateWithUnit,
      );
      expect(result.actionType).toBe('gameEffect');
      const resultIsExpectedGameEffect =
        expectedGameEffectSchema.safeParse(result);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe(
        'completeAttackApply',
      );
    });
  });

  describe('completion', () => {
    it('should return completeAttackApply when all substeps are completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: false,
          unitRetreated: true,
          unitReversed: false,
        },
        retreatState: {
          substepType: 'retreat',
          retreatingUnit: {
            unit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          legalRetreatOptions: new Set([]),
          finalPosition: { coordinate: 'E-4', facing: 'north' },
          routState: undefined,
          completed: true,
        },
        completed: false,
      });

      const result = getExpectedAttackApplyEvent(attackApplyState, gameState);
      expect(result.actionType).toBe('gameEffect');
      const resultIsExpectedGameEffect =
        expectedGameEffectSchema.safeParse(result);
      expect(resultIsExpectedGameEffect.success).toBe(true);
      expect(resultIsExpectedGameEffect.data?.effectType).toBe(
        'completeAttackApply',
      );
    });

    it('should throw error when attack apply is already completed', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: false,
          unitRetreated: true,
          unitReversed: false,
        },
        retreatState: {
          substepType: 'retreat',
          retreatingUnit: {
            unit,
            placement: { coordinate: 'E-5', facing: 'north' },
          },
          legalRetreatOptions: new Set([]),
          finalPosition: { coordinate: 'E-4', facing: 'north' },
          routState: undefined,
          completed: true,
        },
        completed: true,
      });

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, gameState),
      ).toThrow('Attack apply state is already complete');
    });
  });

  describe('error cases', () => {
    it('should throw error when no results are reported', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: false,
          unitRetreated: false,
          unitReversed: false,
        },
        completed: false,
      });

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, gameState),
      ).toThrow('Attack apply state not initialized correctly');
    });

    it('should throw error when results are reported but no substates are defined', () => {
      const unit = createTestUnit('white', { attack: 2 });
      const gameState = createEmptyGameState();

      const attackApplyState = createAttackApplyState(unit, {
        attackResult: {
          unitRouted: true,
          unitRetreated: false,
          unitReversed: false,
        },
        routState: undefined,
        retreatState: undefined,
        reverseState: undefined,
        completed: false,
      });

      expect(() =>
        getExpectedAttackApplyEvent(attackApplyState, gameState),
      ).toThrow('Attack apply state not initialized correctly');
    });
  });
});
