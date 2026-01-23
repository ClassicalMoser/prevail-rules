import { createEmptyGameState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { removeUnitFromReserve } from './removeUnitFromReserve';

describe('removeUnitFromReserve', () => {
  describe('removing unit from reserve with one unit', () => {
    it('should remove unit and leave empty set', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = new Set([unit]);

      const newGameState = removeUnitFromReserve(gameState, unit);

      expect(newGameState).not.toBe(gameState);
      expect(newGameState.reservedUnits.size).toBe(0);
    });

    it('should not mutate the original game state', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = new Set([unit]);

      removeUnitFromReserve(gameState, unit);

      expect(gameState.reservedUnits.size).toBe(1);
      expect(Array.from(gameState.reservedUnits)).toContain(unit);
    });
  });

  describe('removing unit from reserve with multiple units', () => {
    it('should remove one unit and preserve others', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = new Set([unit1, unit2]);

      const newGameState = removeUnitFromReserve(gameState, unit1);

      expect(newGameState.reservedUnits.size).toBe(1);
      expect(Array.from(newGameState.reservedUnits)).toContain(unit2);
      expect(Array.from(newGameState.reservedUnits)).not.toContain(unit1);
    });

    it('should remove unit using value equality for filtering', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = new Set([unit1, unit2]);

      // The function uses Set.has() for initial check (reference equality)
      // but filters using isSameUnitInstance (value equality)
      const newGameState = removeUnitFromReserve(gameState, unit1);

      expect(newGameState.reservedUnits.size).toBe(1);
      expect(Array.from(newGameState.reservedUnits)).toContain(unit2);
    });

    it('should not mutate the original game state when removing from multiple units', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      gameState.reservedUnits = new Set([unit1, unit2]);

      removeUnitFromReserve(gameState, unit1);

      expect(gameState.reservedUnits.size).toBe(2);
      expect(Array.from(gameState.reservedUnits)).toContain(unit1);
      expect(Array.from(gameState.reservedUnits)).toContain(unit2);
    });
  });

  describe('error cases', () => {
    it('should throw error when unit not present in reserve', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });

      expect(() => removeUnitFromReserve(gameState, unit)).toThrow(
        'Unit not present in reserve',
      );
    });

    it('should throw error when trying to remove unit with different instance number', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      gameState.reservedUnits = new Set([unit1]);

      expect(() => removeUnitFromReserve(gameState, unit2)).toThrow(
        'Unit not present in reserve',
      );
    });

    it('should throw error when trying to remove already removed unit', () => {
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
    it('should preserve routed units', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });
      gameState.reservedUnits = new Set([unit]);

      const newGameState = removeUnitFromReserve(gameState, unit);

      expect(newGameState.routedUnits).toBe(gameState.routedUnits);
    });
  });
});
