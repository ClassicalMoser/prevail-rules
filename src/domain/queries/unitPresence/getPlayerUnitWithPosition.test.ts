import type { StandardBoardCoordinate, UnitFacing } from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { createEmptyStandardBoard } from '../createEmptyBoard';
import { getOppositeFacing } from '../facings';
import { getPlayerUnitWithPosition } from './getPlayerUnitWithPosition';

describe('getPlayerUnitWithPosition', () => {
  const coordinate: StandardBoardCoordinate = 'E-5';

  describe('empty space', () => {
    it("should return undefined when there's no unit", () => {
      const board = createEmptyStandardBoard();
      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeUndefined();
    });
  });

  describe('single unit presence', () => {
    it("should return the unit when there's a single friendly unit", () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        { unit, coordinate, facing: 'north' },
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.unit).toBe(unit);
      expect(result?.placement.coordinate).toBe(coordinate);
      expect(result?.placement.facing).toBe('north');
    });

    it("should return undefined when there's a single enemy unit", () => {
      const enemyUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithUnits([
        { unit: enemyUnit, coordinate, facing: 'north' },
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeUndefined();
    });

    it('should return the unit with correct facing for different facings', () => {
      const facings: UnitFacing[] = [
        'north',
        'northEast',
        'east',
        'southEast',
        'south',
        'southWest',
        'west',
        'northWest',
      ];

      for (const facing of facings) {
        const unit = createTestUnit('black', { attack: 3 });
        const board = createBoardWithUnits([{ unit, coordinate, facing }]);

        const result = getPlayerUnitWithPosition(board, coordinate, 'black');

        expect(result).toBeDefined();
        expect(result?.placement.facing).toBe(facing);
      }
    });

    it('should return the unit with correct coordinate', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const testCoordinate: StandardBoardCoordinate = 'A-1';
      const board = createBoardWithUnits([
        { unit, coordinate: testCoordinate, facing: 'north' },
      ]);

      const result = getPlayerUnitWithPosition(board, testCoordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.placement.coordinate).toBe(testCoordinate);
    });
  });

  describe('engaged unit presence', () => {
    it('should return the primary unit when primary is friendly', () => {
      const primaryUnit = createTestUnit('black', { attack: 3 });
      const secondaryUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.unit).toBe(primaryUnit);
      expect(result?.placement.coordinate).toBe(coordinate);
      expect(result?.placement.facing).toBe('north');
    });

    it('should return the secondary unit when secondary is friendly', () => {
      const primaryUnit = createTestUnit('white', { attack: 3 });
      const secondaryUnit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.unit).toBe(secondaryUnit);
      expect(result?.placement.coordinate).toBe(coordinate);
      expect(result?.placement.facing).toBe('south'); // Secondary faces opposite primary
    });

    it('should return secondary unit with correct opposite facing', () => {
      const primaryUnit = createTestUnit('white', { attack: 3 });
      const secondaryUnit = createTestUnit('black', { attack: 3 });
      const primaryFacing: UnitFacing = 'east';
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        primaryFacing,
      );

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.unit).toBe(secondaryUnit);
      expect(result?.placement.facing).toBe('west'); // Opposite of east
    });

    it('should handle all facings correctly for engaged units', () => {
      const facings: UnitFacing[] = [
        'north',
        'northEast',
        'east',
        'southEast',
        'south',
        'southWest',
        'west',
        'northWest',
      ];

      for (const primaryFacing of facings) {
        const primaryUnit = createTestUnit('white', { attack: 3 });
        const secondaryUnit = createTestUnit('black', { attack: 3 });
        const board = createBoardWithEngagedUnits(
          primaryUnit,
          secondaryUnit,
          coordinate,
          primaryFacing,
        );

        const result = getPlayerUnitWithPosition(board, coordinate, 'black');

        expect(result).toBeDefined();
        expect(result?.unit).toBe(secondaryUnit);
        // The facing should be opposite of primary
        const expectedFacing = getOppositeFacing(primaryFacing);
        expect(result?.placement.facing).toBe(expectedFacing);
      }
    });
  });

  describe('different player sides', () => {
    it('should return unit for black player when black unit is present', () => {
      const blackUnit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        { unit: blackUnit, coordinate, facing: 'north' },
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.unit.playerSide).toBe('black');
    });

    it('should return unit for white player when white unit is present', () => {
      const whiteUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithUnits([
        { unit: whiteUnit, coordinate, facing: 'north' },
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'white');

      expect(result).toBeDefined();
      expect(result?.unit.playerSide).toBe('white');
    });

    it('should return undefined for black player when only white unit is present', () => {
      const whiteUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithUnits([
        { unit: whiteUnit, coordinate, facing: 'north' },
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeUndefined();
    });

    it('should return undefined for white player when only black unit is present', () => {
      const blackUnit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        { unit: blackUnit, coordinate, facing: 'north' },
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'white');

      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle different coordinates correctly', () => {
      const coordinates: StandardBoardCoordinate[] = [
        'A-1',
        'A-18',
        'L-1',
        'L-18',
        'E-5',
      ];

      for (const coord of coordinates) {
        const unit = createTestUnit('black', { attack: 3 });
        const board = createBoardWithUnits([
          { unit, coordinate: coord, facing: 'north' },
        ]);

        const result = getPlayerUnitWithPosition(board, coord, 'black');

        expect(result).toBeDefined();
        expect(result?.placement.coordinate).toBe(coord);
      }
    });

    it('should return undefined when checking wrong coordinate', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'north' },
      ]);

      const result = getPlayerUnitWithPosition(board, 'A-1', 'black');

      expect(result).toBeUndefined();
    });

    it('should throw when space is invalid', () => {
      const board = createEmptyStandardBoard();
      expect(() =>
        getPlayerUnitWithPosition(
          board,
          'invalid' as StandardBoardCoordinate,
          'black',
        ),
      ).toThrow(
        new Error('Coordinate invalid does not exist on standard board.'),
      );
    });
  });
});
