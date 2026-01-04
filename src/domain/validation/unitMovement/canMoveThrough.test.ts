import type {
  GameState,
  PlayerSide,
  StandardBoard,
  StandardBoardCoordinate,
  UnitInstance,
} from '@entities';
import {
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createGameStateWithSingleUnit,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { canMoveThrough } from './canMoveThrough';

describe('canMoveThrough', () => {
  const gameState: GameState<StandardBoard> = createEmptyGameState();
  const coordinate: StandardBoardCoordinate = 'E-5';

  // Helper function to create a unit instance with a specific player side and flexibility value.
  const createUnitInstance = (
    playerSide: PlayerSide,
    flexibility: number,
  ): UnitInstance => {
    return createTestUnit(playerSide, { flexibility });
  };

  describe('invalid inputs', () => {
    it('should return false for a non-existent coordinate', () => {
      const unit = createUnitInstance('black', 2);
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;
      expect(canMoveThrough(unit, invalidCoordinate, gameState)).toBe(false);
    });
  });

  describe('empty space', () => {
    it('should return true for an empty space', () => {
      const unit = createUnitInstance('black', 2);
      expect(canMoveThrough(unit, coordinate, gameState)).toBe(true);
    });
  });

  describe('engaged space', () => {
    it('should return false for a space with two engaged units', () => {
      const unit = createUnitInstance('black', 2);
      const primaryUnit = createUnitInstance('black', 2);
      const secondaryUnit = createUnitInstance('white', 2);
      const testGameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
      );
      expect(canMoveThrough(unit, coordinate, testGameState)).toBe(false);
    });
  });

  describe('single enemy unit', () => {
    it('should return false for a space with a single enemy unit', () => {
      const unit = createUnitInstance('black', 2);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'white', {
        flexibility: 2,
      });
      expect(canMoveThrough(unit, coordinate, testGameState)).toBe(false);
    });
  });

  describe('single friendly unit with different flexibility values', () => {
    it('should return false when combined flexibility is less than threshold (1 + 1 = 2)', () => {
      const movingUnit = createUnitInstance('black', 1);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 1,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(false);
    });

    it('should return false when combined flexibility is less than threshold (1 + 2 = 3)', () => {
      const movingUnit = createUnitInstance('black', 1);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 2,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(false);
    });

    it('should return false when combined flexibility is less than threshold (2 + 1 = 3)', () => {
      const movingUnit = createUnitInstance('black', 2);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 1,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(false);
    });

    it('should return true when combined flexibility equals threshold (2 + 2 = 4)', () => {
      const movingUnit = createUnitInstance('black', 2);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 2,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(true);
    });

    it('should return true when combined flexibility equals threshold (1 + 3 = 4)', () => {
      const movingUnit = createUnitInstance('black', 1);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 3,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(true);
    });

    it('should return true when combined flexibility equals threshold (3 + 1 = 4)', () => {
      const movingUnit = createUnitInstance('black', 3);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 1,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(true);
    });

    it('should return true when combined flexibility exceeds threshold (3 + 3 = 6)', () => {
      const movingUnit = createUnitInstance('black', 3);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 3,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(true);
    });

    it('should return true when combined flexibility exceeds threshold (2 + 3 = 5)', () => {
      const movingUnit = createUnitInstance('black', 2);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 2,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(true);
    });

    it('should return true when combined flexibility exceeds threshold (3 + 2 = 5)', () => {
      const movingUnit = createUnitInstance('black', 3);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'black', {
        flexibility: 2,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(true);
    });

    it('should work with white player units', () => {
      const movingUnit = createUnitInstance('white', 2);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'white', {
        flexibility: 2,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(true);
    });

    it('should return false for white player when flexibility is insufficient', () => {
      const movingUnit = createUnitInstance('white', 1);
      const testGameState = createGameStateWithSingleUnit(coordinate, 'white', {
        flexibility: 1,
      });
      expect(canMoveThrough(movingUnit, coordinate, testGameState)).toBe(false);
    });
  });
});
