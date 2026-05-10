import type { UnitType } from '@entities';
import { createEmptyGameState, createTestUnit } from '@testing';

import { applyAttackValue } from './applyAttackValue';

/** Explicit type: stacked rout/reverse/retreat thresholds come from applyAttackValue rules, not from tempUnits. */
const unitTypeWithStackedDefense: UnitType = {
  cost: 1,
  id: '00000000-0000-4000-8000-000000000001',
  limit: 1,
  name: 'Test stacked defense',
  routPenalty: 0,
  stats: {
    attack: 1,
    flexibility: 1,
    range: 0,
    retreat: 3,
    reverse: 4,
    rout: 5,
    speed: 1,
  },
  traits: [],
};

/**
 * ApplyAttackValue: compares attack value to the unit's current rout, reverse, and retreat stats and returns
 * which thresholds are met or exceeded.
 */
describe(applyAttackValue, () => {
  describe('when attack strictly exceeds a threshold', () => {
    it('given rout threshold passed, unitRouted true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitRouted).toBeTruthy();
    });

    it('given reverse threshold passed, unitReversed true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitReversed).toBeTruthy();
    });

    it('given retreat threshold passed, unitRetreated true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitRetreated).toBeTruthy();
    });
  });

  describe('when attack equals a threshold', () => {
    it('given attack equals rout, unitRouted true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitRouted).toBeTruthy();
    });

    it('given attack equals reverse, unitReversed true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitReversed).toBeTruthy();
    });

    it('given attack equals retreat, unitRetreated true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitRetreated).toBeTruthy();
    });
  });

  describe('when attack is below each threshold', () => {
    it('given attack below rout, unitRouted false', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitRouted).toBeFalsy();
    });

    it('given attack below reverse, unitReversed false', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitReversed).toBeFalsy();
    });

    it('given attack below retreat, unitRetreated false', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitRetreated).toBeFalsy();
    });
  });

  describe('stacked rout, reverse, retreat on one unit', () => {
    it('given attack below all three, all flags false', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', {
        unitType: unitTypeWithStackedDefense,
      });
      const result2 = applyAttackValue(gameState, 2, unit);
      expect(result2).toStrictEqual({
        unitRetreated: false,
        unitReversed: false,
        unitRouted: false,
      });
    });

    it('given attack meets retreat only then retreat and reverse', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', {
        unitType: unitTypeWithStackedDefense,
      });
      const result3 = applyAttackValue(gameState, 3, unit);
      const result4 = applyAttackValue(gameState, 4, unit);
      expect(result3).toStrictEqual({
        unitRetreated: true,
        unitReversed: false,
        unitRouted: false,
      });
      expect(result4).toStrictEqual({
        unitRetreated: true,
        unitReversed: true,
        unitRouted: false,
      });
    });

    it('given attack meets rout or higher, all flags true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', {
        unitType: unitTypeWithStackedDefense,
      });
      const result5 = applyAttackValue(gameState, 5, unit);
      const result6 = applyAttackValue(gameState, 6, unit);

      expect(result5).toStrictEqual({
        unitRetreated: true,
        unitReversed: true,
        unitRouted: true,
      });
      expect(result6).toStrictEqual({
        unitRetreated: true,
        unitReversed: true,
        unitRouted: true,
      });
    });
  });
});
