import { createEmptyGameState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { applyAttackValue } from './applyAttackValue';

/**
 * applyAttackValue: compares attack value to the unit's current rout, reverse, and retreat stats and returns
 * which thresholds are met or exceeded.
 */
describe('applyAttackValue', () => {
  describe('when attack strictly exceeds a threshold', () => {
    it('given rout threshold passed, unitRouted true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitRouted).toEqual(true);
    });

    it('given reverse threshold passed, unitReversed true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitReversed).toEqual(true);
    });

    it('given retreat threshold passed, unitRetreated true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitRetreated).toEqual(true);
    });
  });

  describe('when attack equals a threshold', () => {
    it('given attack equals rout, unitRouted true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitRouted).toEqual(true);
    });
    it('given attack equals reverse, unitReversed true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitReversed).toEqual(true);
    });
    it('given attack equals retreat, unitRetreated true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitRetreated).toEqual(true);
    });
  });

  describe('when attack is below each threshold', () => {
    it('given attack below rout, unitRouted false', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitRouted).toEqual(false);
    });
    it('given attack below reverse, unitReversed false', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitReversed).toEqual(false);
    });
    it('given attack below retreat, unitRetreated false', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitRetreated).toEqual(false);
    });
  });

  describe('stacked rout, reverse, retreat on one unit', () => {
    it('given attack below all three, all flags false', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', {
        rout: 5,
        reverse: 4,
        retreat: 3,
      });
      const result2 = applyAttackValue(gameState, 2, unit);
      expect(result2).toEqual({
        unitRouted: false,
        unitReversed: false,
        unitRetreated: false,
      });
    });
    it('given attack meets retreat only then retreat and reverse', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', {
        rout: 5,
        reverse: 4,
        retreat: 3,
      });
      const result3 = applyAttackValue(gameState, 3, unit);
      const result4 = applyAttackValue(gameState, 4, unit);
      expect(result3).toEqual({
        unitRouted: false,
        unitReversed: false,
        unitRetreated: true,
      });
      expect(result4).toEqual({
        unitRouted: false,
        unitReversed: true,
        unitRetreated: true,
      });
    });
    it('given attack meets rout or higher, all flags true', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', {
        rout: 5,
        reverse: 4,
        retreat: 3,
      });
      const result5 = applyAttackValue(gameState, 5, unit);
      const result6 = applyAttackValue(gameState, 6, unit);

      expect(result5).toEqual({
        unitRouted: true,
        unitReversed: true,
        unitRetreated: true,
      });
      expect(result6).toEqual({
        unitRouted: true,
        unitReversed: true,
        unitRetreated: true,
      });
    });
  });
});
