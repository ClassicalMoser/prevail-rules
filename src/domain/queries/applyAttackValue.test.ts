import { createEmptyGameState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { applyAttackValue } from './applyAttackValue';

describe('applyAttackValue', () => {
  describe('when the attack value exceeds the defensive stat', () => {
    it('should return isRouted true, when the unit is routed', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitRouted).toEqual(true);
    });

    it('should return isReversed true when the unit is reversed', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitReversed).toEqual(true);
    });

    it('should return isRetreated true when the unit is retreated', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 4, unit);
      expect(result.unitRetreated).toEqual(true);
    });
  });
  describe('when the attack value equals the defensive stat', () => {
    it('should return isRouted true when the unit is routed', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitRouted).toEqual(true);
    });
    it('should return isReversed true when the unit is reversed', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitReversed).toEqual(true);
    });
    it('should return isRetreated true when the unit is retreated', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 3, unit);
      expect(result.unitRetreated).toEqual(true);
    });
  });
  describe('when the attack value is less than the defensive stat', () => {
    it('should return isRouted false when the unit is not routed', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { rout: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitRouted).toEqual(false);
    });
    it('should return isReversed false when the unit is not reversed', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { reverse: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitReversed).toEqual(false);
    });
    it('should return isRetreated false when the unit is not retreated', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { retreat: 3 });
      const result = applyAttackValue(gameState, 2, unit);
      expect(result.unitRetreated).toEqual(false);
    });
  });
  describe('edge cases', () => {
    describe('when the different units are checked', () => {
      it('should return false on all when attack is lower than all', () => {
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
      it('should return different values when attack is between some', () => {
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
      it('should return true on all when attack is equal to or greater than highest', () => {
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
});
