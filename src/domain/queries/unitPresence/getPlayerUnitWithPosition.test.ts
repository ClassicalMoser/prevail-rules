import type { Coordinate, UnitFacing } from '@entities';
import { getOppositeFacing } from '@queries/facings';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { getPlayerUnitWithPosition } from './getPlayerUnitWithPosition';

/**
 * GetPlayerUnitWithPosition: unit + placement at a coordinate for a player (single or engaged slot).
 */
describe('getPlayerUnitWithPosition function', () => {
  const coordinate: Coordinate = 'E-5';

  describe('empty space', () => {
    it('returns undefined for an empty space', () => {
      const board = createEmptyStandardBoard();
      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeUndefined();
    });
  });

  describe('single unit presence', () => {
    it('returns the friendly unit and its facing', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([placed(unit, coordinate, 'north')]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.unit).toBe(unit);
      expect(result?.placement.coordinate).toBe(coordinate);
      expect(result?.placement.facing).toBe('north');
    });

    it('returns undefined when the only unit is the other side', () => {
      const enemyUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithUnits([
        placed(enemyUnit, coordinate, 'north'),
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeUndefined();
    });

    it('returns the facing the unit was placed with', () => {
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
        const board = createBoardWithUnits([placed(unit, coordinate, facing)]);

        const result = getPlayerUnitWithPosition(board, coordinate, 'black');

        expect(result).toBeDefined();
        expect(result?.placement.facing).toBe(facing);
      }
    });

    it('returns the coordinate the unit was placed on', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const testCoordinate: Coordinate = 'A-1';
      const board = createBoardWithUnits([
        placed(unit, testCoordinate, 'north'),
      ]);

      const result = getPlayerUnitWithPosition(board, testCoordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.placement.coordinate).toBe(testCoordinate);
    });
  });

  describe('engaged unit presence', () => {
    it('returns the primary unit when primary is friendly', () => {
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

    it('returns the secondary unit when secondary is friendly', () => {
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

    it('returns the secondary facing opposite the primary', () => {
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

    it('returns the opposite facing for every primary facing', () => {
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
    it('returns unit for black player when black unit is present', () => {
      const blackUnit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        placed(blackUnit, coordinate, 'north'),
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeDefined();
      expect(result?.unit.playerSide).toBe('black');
    });

    it('returns unit for white player when white unit is present', () => {
      const whiteUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithUnits([
        placed(whiteUnit, coordinate, 'north'),
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'white');

      expect(result).toBeDefined();
      expect(result?.unit.playerSide).toBe('white');
    });

    it('returns undefined for black player when only white unit is present', () => {
      const whiteUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithUnits([
        placed(whiteUnit, coordinate, 'north'),
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'black');

      expect(result).toBeUndefined();
    });

    it('returns undefined for white player when only black unit is present', () => {
      const blackUnit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        placed(blackUnit, coordinate, 'north'),
      ]);

      const result = getPlayerUnitWithPosition(board, coordinate, 'white');

      expect(result).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('returns the unit at each corner and at the center', () => {
      const coordinates: Coordinate[] = ['A-1', 'A-18', 'L-1', 'L-18', 'E-5'];

      for (const coord of coordinates) {
        const unit = createTestUnit('black', { attack: 3 });
        const board = createBoardWithUnits([placed(unit, coord, 'north')]);

        const result = getPlayerUnitWithPosition(board, coord, 'black');

        expect(result).toBeDefined();
        expect(result?.placement.coordinate).toBe(coord);
      }
    });

    it('returns undefined when checking wrong coordinate', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([placed(unit, 'E-5', 'north')]);

      const result = getPlayerUnitWithPosition(board, 'A-1', 'black');

      expect(result).toBeUndefined();
    });

    it('throws when space is invalid', () => {
      const board = createEmptyStandardBoard();
      expect(() =>
        getPlayerUnitWithPosition(board, 'invalid' as Coordinate, 'black'),
      ).toThrow(
        new Error('Coordinate invalid does not exist on standard board.'),
      );
    });
  });
});
