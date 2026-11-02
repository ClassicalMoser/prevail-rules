import type { Coordinate } from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { getPositionOfUnit } from './getPositionOfUnit';

/**
 * GetPositionOfUnit: coordinate and facing for a unit instance on the board, if present.
 */
describe('getPositionOfUnit function', () => {
  describe('single unit presence', () => {
    it('returns the coordinate and facing of a single unit', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const coordinate: Coordinate = 'E-5';
      const facing = 'north';
      const board = createBoardWithUnits([
        { placement: { coordinate, facing }, unit },
      ]);

      const placement = getPositionOfUnit(board, unit);

      expect(placement.coordinate).toBe(coordinate);
      expect(placement.facing).toBe(facing);
    });

    it('returns the facing the unit was placed with', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const coordinate: Coordinate = 'E-5';
      const facing = 'southEast';
      const board = createBoardWithUnits([
        { placement: { coordinate, facing }, unit },
      ]);

      const placement = getPositionOfUnit(board, unit);

      expect(placement.coordinate).toBe(coordinate);
      expect(placement.facing).toBe(facing);
    });

    it('returns the coordinate the unit was placed on', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const coordinate: Coordinate = 'A-1';
      const board = createBoardWithUnits([
        { placement: { coordinate, facing: 'north' }, unit },
      ]);

      const placement = getPositionOfUnit(board, unit);

      expect(placement.coordinate).toBe(coordinate);
    });
  });

  describe('engaged unit presence', () => {
    it('returns the primary facing for the primary unit', () => {
      const primaryUnit = createTestUnit('black', { attack: 3 });
      const secondaryUnit = createTestUnit('white', { attack: 3 });
      const coordinate: Coordinate = 'E-5';
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

    it('returns the opposite facing for the secondary unit', () => {
      const primaryUnit = createTestUnit('white', { attack: 3 });
      const secondaryUnit = createTestUnit('black', { attack: 3 });
      const coordinate: Coordinate = 'E-5';
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

    it('throws when the searched unit matches neither engaged unit', () => {
      const primaryUnit = createTestUnit('black', { attack: 3 });
      const secondaryUnit = createTestUnit('white', { attack: 3 });
      const coordinate: Coordinate = 'E-5';
      const primaryFacing = 'north';
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        primaryFacing,
      );

      expect(() => {
        getPositionOfUnit(board, createTestUnit('black', { attack: 2 }));
      }).toThrow(new Error('Unit not found on board'));
    });
  });

  describe('unit not found', () => {
    it('throws when unit is not on board', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createEmptyStandardBoard();

      expect(() => {
        getPositionOfUnit(board, unit);
      }).toThrow(new Error('Unit not found on board'));
    });

    it('throws when a same-side unit with a different instance number is the one on the board', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
      const board = createBoardWithUnits([
        { placement: { coordinate: 'E-5', facing: 'north' }, unit: unit2 },
      ]);

      expect(() => {
        getPositionOfUnit(board, unit1);
      }).toThrow(new Error('Unit not found on board'));
    });
  });

  describe('value-based comparison', () => {
    it('returns the placement when a different object has the same side, type, and instance number', () => {
      const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      const board = createBoardWithUnits([
        { placement: { coordinate: 'E-5', facing: 'north' }, unit: unit1 },
      ]);

      // Create a new unit instance with same properties (different reference)
      const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
      expect(unit1).not.toBe(unit2); // Different references

      const placement = getPositionOfUnit(board, unit2);

      // Should find it by value comparison
      expect(placement.coordinate).toBe('E-5');
      expect(placement.facing).toBe('north');
    });
  });
});
