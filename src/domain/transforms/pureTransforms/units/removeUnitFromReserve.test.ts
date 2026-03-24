import { createEmptyGameState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { removeUnitFromReserve } from './removeUnitFromReserve';

/**
 * removeUnitFromReserve: removeUnitFromReserve.
 */
describe('removeUnitFromReserve', () => {
  describe('removing unit from reserve with one unit', () => {
    it('given remove unit and leave empty set', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = new Set([unit]);

      const newGameState = removeUnitFromReserve(gameState, unit);

      expect(newGameState).not.toBe(gameState);
      expect(newGameState.reservedUnits.size).toBe(0);
    });

    it('given not mutate the original game state', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = new Set([unit]);

      removeUnitFromReserve(gameState, unit);

      expect(gameState.reservedUnits.size).toBe(1);
      expect([...gameState.reservedUnits]).toContain(unit);
    });
  });

  describe('removing unit from reserve with multiple units', () => {
    it('given remove one unit and preserve others', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = new Set([unit1, unit2]);

      const newGameState = removeUnitFromReserve(gameState, unit1);

      expect(newGameState.reservedUnits.size).toBe(1);
      expect([...newGameState.reservedUnits]).toContain(unit2);
      expect([...newGameState.reservedUnits]).not.toContain(unit1);
    });

    it('given remove by value equality when passing different reference', () => {
      const gameState = createEmptyGameState();
      const unitInReserve = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = new Set([unitInReserve, unit2]);
      const sameValueDifferentRef = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });

      const newGameState = removeUnitFromReserve(
        gameState,
        sameValueDifferentRef,
      );

      expect(newGameState.reservedUnits.size).toBe(1);
      expect([...newGameState.reservedUnits]).toContain(unit2);
    });

    it('given removing from multiple units, does not mutate the original game state', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = new Set([unit1, unit2]);

      removeUnitFromReserve(gameState, unit1);

      expect(gameState.reservedUnits.size).toBe(2);
      expect([...gameState.reservedUnits]).toContain(unit1);
      expect([...gameState.reservedUnits]).toContain(unit2);
    });
  });

  describe('error cases', () => {
    it('given error when unit not present in reserve, throws', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });

      expect(() => removeUnitFromReserve(gameState, unit)).toThrow(
        'Unit not present in reserve',
      );
    });

    it('given error when trying to remove unit with different instance number, throws', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      gameState.reservedUnits = new Set([unit1]);

      expect(() => removeUnitFromReserve(gameState, unit2)).toThrow(
        'Unit not present in reserve',
      );
    });

    it('given error when trying to remove already removed unit, throws', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = new Set([unit]);
      const gameStateAfterRemoval = removeUnitFromReserve(gameState, unit);

      expect(() => removeUnitFromReserve(gameStateAfterRemoval, unit)).toThrow(
        'Unit not present in reserve',
      );
    });
  });

  describe('preserving other game state', () => {
    it('given preserve routed units', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = new Set([unit]);

      const newGameState = removeUnitFromReserve(gameState, unit);

      expect(newGameState.routedUnits).toBe(gameState.routedUnits);
    });
  });
});
