import type {
  PlayerSide,
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
  UnitInstance,
  UnitWithPlacement,
} from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  getUnitByStatValue,
} from '@testing';
import { createEmptyStandardBoard, createUnitInstance } from '@transforms';
import { describe, expect, it } from 'vitest';
import { isAtPlacement } from './isAtPlacement';

describe('isAtPlacement', () => {
  const standardBoard: StandardBoard = createEmptyStandardBoard();
  const coordinate: StandardBoardCoordinate = 'E-5';

  // Use stat-based lookups instead of names to avoid brittleness
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);
  const flexibility2UnitType = getUnitByStatValue('flexibility', 2);

  // Helper function to create a unit instance
  const createUnit = (
    playerSide: PlayerSide,
    unitType = flexibility1UnitType,
    instanceNumber = 1,
  ): UnitInstance => {
    return createUnitInstance(playerSide, unitType, instanceNumber);
  };

  // Helper function to create a UnitWithPlacement
  const createUnitWithPlacement = (
    unit: UnitInstance,
    coord: StandardBoardCoordinate,
    facing: UnitFacing,
  ): UnitWithPlacement<StandardBoard> => {
    return {
      unit,
      placement: {
        coordinate: coord,
        facing,
      },
    };
  };

  describe('invalid inputs', () => {
    it('should return false for a non-existent coordinate', () => {
      const unit = createUnit('black');
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        invalidCoordinate,
        'north',
      );

      const { result } = isAtPlacement(standardBoard, unitWithPlacement);
      expect(result).toBe(false);
    });
  });

  describe('empty space', () => {
    it('should return false for an empty space with no unit presence', () => {
      const unit = createUnit('black');
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(standardBoard, unitWithPlacement);
      expect(result).toBe(false);
    });
  });

  describe('single friendly unit', () => {
    it('should return true when unit matches exactly', () => {
      const unit = createUnit('black');
      const board = createBoardWithUnits([
        { unit, coordinate, facing: 'north' },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(true);
    });

    it('should return false when facing does not match', () => {
      const unit = createUnit('black');
      const board = createBoardWithUnits([
        { unit, coordinate, facing: 'north' },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        unit,
        coordinate,
        'south',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when playerSide does not match', () => {
      const unit = createUnit('black');
      const differentPlayerUnit = createUnit('white');
      const board = createBoardWithUnits([
        { unit, coordinate, facing: 'north' },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        differentPlayerUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when unitType does not match', () => {
      const unit = createUnit('black', flexibility1UnitType);
      const differentTypeUnit = createUnit('black', flexibility2UnitType);
      const board = createBoardWithUnits([
        { unit, coordinate, facing: 'north' },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        differentTypeUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when instanceNumber does not match', () => {
      const unit = createUnit('black', flexibility1UnitType, 1);
      const differentInstanceUnit = createUnit(
        'black',
        flexibility1UnitType,
        2,
      );
      const board = createBoardWithUnits([
        { unit, coordinate, facing: 'north' },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        differentInstanceUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return true when unit matches by value (different object reference)', () => {
      const unit = createUnit('black', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate, facing: 'north' },
      ]);
      // Create a new unit instance with the same properties
      const sameUnit = createUnit('black', flexibility1UnitType, 1);
      const unitWithPlacement = createUnitWithPlacement(
        sameUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(true);
    });
  });

  describe('single enemy unit', () => {
    it('should return false when unit at coordinate is an enemy', () => {
      const enemyUnit = createUnit('white');
      const friendlyUnit = createUnit('black');
      const board = createBoardWithUnits([
        { unit: enemyUnit, coordinate, facing: 'north' },
      ]);
      const unitWithPlacement = createUnitWithPlacement(
        friendlyUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });
  });

  describe('engaged units - primary unit is friendly', () => {
    it('should return true when primary unit matches exactly', () => {
      const primaryUnit = createUnit('black');
      const secondaryUnit = createUnit('white');
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(true);
    });

    it('should return false when primary unit facing does not match', () => {
      const primaryUnit = createUnit('black');
      const secondaryUnit = createUnit('white');
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      const unitWithPlacement = createUnitWithPlacement(
        primaryUnit,
        coordinate,
        'south',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when primary unit playerSide does not match', () => {
      const primaryUnit = createUnit('black');
      const secondaryUnit = createUnit('white');
      const differentPlayerUnit = createUnit('white');
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentPlayerUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when primary unit unitType does not match', () => {
      const primaryUnit = createUnit('black', flexibility1UnitType);
      const secondaryUnit = createUnit('white');
      const differentTypeUnit = createUnit('black', flexibility2UnitType);
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentTypeUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when primary unit instanceNumber does not match', () => {
      const primaryUnit = createUnit('black', flexibility1UnitType, 1);
      const secondaryUnit = createUnit('white');
      const differentInstanceUnit = createUnit(
        'black',
        flexibility1UnitType,
        2,
      );
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentInstanceUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });
  });

  describe('engaged units - secondary unit is friendly', () => {
    it('should return true when secondary unit matches exactly', () => {
      const primaryUnit = createUnit('white');
      const secondaryUnit = createUnit('black');
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      // Secondary unit facing is opposite of primary facing
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        'south', // opposite of "north"
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(true);
    });

    it('should return false when secondary unit facing does not match', () => {
      const primaryUnit = createUnit('white');
      const secondaryUnit = createUnit('black');
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      // Wrong facing (should be "south" which is opposite of "north")
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        'north',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when secondary unit playerSide does not match', () => {
      const primaryUnit = createUnit('white');
      const secondaryUnit = createUnit('black');
      const differentPlayerUnit = createUnit('white');
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentPlayerUnit,
        coordinate,
        'south',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when secondary unit unitType does not match', () => {
      const primaryUnit = createUnit('white');
      const secondaryUnit = createUnit('black', flexibility1UnitType);
      const differentTypeUnit = createUnit('black', flexibility2UnitType);
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentTypeUnit,
        coordinate,
        'south',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return false when secondary unit instanceNumber does not match', () => {
      const primaryUnit = createUnit('white');
      const secondaryUnit = createUnit('black', flexibility1UnitType, 1);
      const differentInstanceUnit = createUnit(
        'black',
        flexibility1UnitType,
        2,
      );
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'north',
      );
      const unitWithPlacement = createUnitWithPlacement(
        differentInstanceUnit,
        coordinate,
        'south',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(false);
    });

    it('should return true when secondary unit matches by value with diagonal facing', () => {
      const primaryUnit = createUnit('white');
      const secondaryUnit = createUnit('black');
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        coordinate,
        'northEast',
      );
      // Secondary unit facing is opposite of primary facing ("northEast" -> "southWest")
      const unitWithPlacement = createUnitWithPlacement(
        secondaryUnit,
        coordinate,
        'southWest',
      );

      const { result } = isAtPlacement(board, unitWithPlacement);
      expect(result).toBe(true);
    });
  });
});
