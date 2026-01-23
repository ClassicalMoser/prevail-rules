import { createEmptyGameState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { addUnitToRouted } from './addUnitToRouted';

describe('addUnitToRouted', () => {
  describe('adding unit to empty set', () => {
    it('should add unit to routed units set', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState).not.toBe(gameState);
      expect(newGameState.routedUnits.size).toBe(1);
      expect(Array.from(newGameState.routedUnits)).toContain(unit);
    });

    it('should not mutate the original game state', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });

      addUnitToRouted(gameState, unit);

      expect(gameState.routedUnits.size).toBe(0);
    });
  });

  describe('adding multiple units', () => {
    it('should add second unit while preserving first', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const gameStateWithUnit1 = addUnitToRouted(gameState, unit1);

      const newGameState = addUnitToRouted(gameStateWithUnit1, unit2);

      expect(newGameState.routedUnits.size).toBe(2);
      expect(Array.from(newGameState.routedUnits)).toContain(unit1);
      expect(Array.from(newGameState.routedUnits)).toContain(unit2);
    });

    it('should not mutate the original game state when adding second unit', () => {
      const gameState = createEmptyGameState();
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
      const gameStateWithUnit1 = addUnitToRouted(gameState, unit1);

      addUnitToRouted(gameStateWithUnit1, unit2);

      expect(gameStateWithUnit1.routedUnits.size).toBe(1);
      expect(Array.from(gameStateWithUnit1.routedUnits)).toContain(unit1);
    });
  });

  describe('error cases', () => {
    it('should throw error when unit already routed', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });
      const gameStateWithUnit = addUnitToRouted(gameState, unit);

      expect(() => addUnitToRouted(gameStateWithUnit, unit)).toThrow(
        'Unit already routed',
      );
    });

    it('should throw error when trying to add same unit instance again', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const gameStateWithUnit = addUnitToRouted(gameState, unit);

      // Even if we create a "new" unit with same properties, Set uses reference equality
      expect(() => addUnitToRouted(gameStateWithUnit, unit)).toThrow(
        'Unit already routed',
      );
    });
  });

  describe('preserving other game state', () => {
    it('should preserve lost commanders', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState.lostCommanders).toBe(gameState.lostCommanders);
    });

    it('should preserve reserved units', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState.reservedUnits).toBe(gameState.reservedUnits);
    });

    it('should preserve board state', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState.boardState).toBe(gameState.boardState);
    });

    it('should preserve card state', () => {
      const gameState = createEmptyGameState();
      const unit = createTestUnit('black', { attack: 3 });

      const newGameState = addUnitToRouted(gameState, unit);

      expect(newGameState.cardState).toBe(gameState.cardState);
    });
  });
});
