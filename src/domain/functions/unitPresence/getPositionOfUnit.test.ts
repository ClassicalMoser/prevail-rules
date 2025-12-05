import type { StandardBoardCoordinate } from '@entities';
import {
  createEmptyStandardBoard,
  getPositionOfUnit,
} from '@functions';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';

describe('getPositionOfUnit', () => {
  describe('single unit presence', () => {
    it('should find unit at its position', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const coordinate: StandardBoardCoordinate = 'E-5';
      const facing = 'north';
      const board = createBoardWithUnits([
        { unit, coordinate, facing },
      ]);

      const placement = getPositionOfUnit(board, unit);

      expect(placement.coordinate).toBe(coordinate);
      expect(placement.facing).toBe(facing);
    });

    it('should find unit with different facing', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const coordinate: StandardBoardCoordinate = 'E-5';
      const facing = 'southEast';
      const board = createBoardWithUnits([
        { unit, coordinate, facing },
      ]);

      const placement = getPositionOfUnit(board, unit);

      expect(placement.coordinate).toBe(coordinate);
      expect(placement.facing).toBe(facing);
    });

    it('should find unit at different coordinates', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const coordinate: StandardBoardCoordinate = 'A-1';
      const board = createBoardWithUnits([
        { unit, coordinate, facing: 'north' },
      ]);

      const placement = getPositionOfUnit(board, unit);

      expect(placement.coordinate).toBe(coordinate);
    });
  });

  describe('engaged unit presence', () => {
    it('should find primary unit in engagement', () => {
      const primaryUnit = createTestUnit('black', { attack: 3 });
      const secondaryUnit = createTestUnit('white', { attack: 3 });
      const coordinate: StandardBoardCoordinate = 'E-5';
      const primaryFacing = 'north';
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        primaryFacing,
      );

      const placement = getPositionOfUnit(board, primaryUnit);

      expect(placement.coordinate).toBe(coordinate);
      expect(placement.facing).toBe(primaryFacing);
    });

    it('should find secondary unit in engagement', () => {
      const primaryUnit = createTestUnit('white', { attack: 3 });
      const secondaryUnit = createTestUnit('black', { attack: 3 });
      const coordinate: StandardBoardCoordinate = 'E-5';
      const primaryFacing = 'north';
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        primaryFacing,
      );

      const placement = getPositionOfUnit(board, secondaryUnit);

      expect(placement.coordinate).toBe(coordinate);
      // Secondary unit faces opposite primary
      expect(placement.facing).toBe('south');
    });
  });

  describe('unit not found', () => {
    it('should throw error when unit is not on board', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();

      expect(() => {
        getPositionOfUnit(board, unit);
      }).toThrow(new Error('Unit not found on board'));
    });

    it('should throw error when unit with same properties but different instance is on board', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const board = createBoardWithUnits([
        { unit: unit2, coordinate: 'E-5', facing: 'north' },
      ]);

      expect(() => {
        getPositionOfUnit(board, unit1);
      }).toThrow(new Error('Unit not found on board'));
    });
  });

  describe('value-based comparison', () => {
    it('should find unit by value even with different object reference', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const board = createBoardWithUnits([
        { unit: unit1, coordinate: 'E-5', facing: 'north' },
      ]);

      // Create a new unit instance with same properties (different reference)
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      expect(unit1 !== unit2).toBe(true); // Different references

      const placement = getPositionOfUnit(board, unit2);

      // Should find it by value comparison
      expect(placement.coordinate).toBe('E-5');
      expect(placement.facing).toBe('north');
    });
  });
});

