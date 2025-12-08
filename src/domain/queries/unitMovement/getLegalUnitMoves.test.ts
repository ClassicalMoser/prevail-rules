import type { StandardBoardCoordinate } from '@entities';
import { createEmptyStandardBoard } from '@queries/createEmptyBoard';
import {
  createBoardWithUnits,
  createUnitInstance,
  getUnitByStatValue,
  hasMove,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getLegalUnitMoves } from './getLegalUnitMoves';

describe('getLegalUnitMoves', () => {
  // Use stat-based lookup instead of name to avoid brittleness
  const flexibility1UnitType = getUnitByStatValue('flexibility', 1);

  describe('unit with flexibility 1 on blank board', () => {
    it('should return legal moves for a unit at center of board facing north', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Unit has speed 2 and flexibility 1
      expect(legalMoves.size).toBeGreaterThan(0);
      expect(hasMove(legalMoves, startingCoordinate, startingFacing)).toBe(
        true,
      );
    });
  });

  describe('with friendly units on board', () => {
    it('should not be able to move through friendly unit with insufficient flexibility', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      // Unit has flexibility 1, so combined flexibility would be 2 (need 4+)
      const friendlyUnit = createUnitInstance('black', flexibility1UnitType, 2);
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
        { unit: friendlyUnit, coordinate: 'D-5', facing: 'north' },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      expect(hasMove(legalMoves, 'D-5')).toBe(false);
      expect(hasMove(legalMoves, 'C-5')).toBe(false);
    });

    it('should be able to move through friendly unit with sufficient flexibility', () => {
      // Use stat-based lookup: flexibility 2
      const highFlexibilityUnitType = getUnitByStatValue('flexibility', 2);
      const unit = createUnitInstance('black', highFlexibilityUnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      // Combined flexibility = 2 + 2 = 4, which is sufficient
      const friendlyUnit = createUnitInstance(
        'black',
        highFlexibilityUnitType,
        2,
      );
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
        { unit: friendlyUnit, coordinate: 'D-5', facing: 'north' },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      expect(hasMove(legalMoves, 'C-5')).toBe(true);
    });

    it('should not be able to move diagonally between two friendly units with insufficient flexibility', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const friendlyUnit1 = createUnitInstance(
        'black',
        flexibility1UnitType,
        1,
      );
      const friendlyUnit2 = createUnitInstance(
        'black',
        flexibility1UnitType,
        2,
      );
      const board = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'northWest' },
        { unit: friendlyUnit1, coordinate: 'D-5', facing: 'north' },
        { unit: friendlyUnit2, coordinate: 'E-4', facing: 'east' },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: 'E-5',
        facing: 'northWest',
      });

      expect(hasMove(legalMoves, 'D-4')).toBe(false);
    });

    it('should be able to move diagonally between two friendly units with sufficient flexibility', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      // Use stat-based lookup: flexibility 3 (Skirmishers)
      const flexibleUnitType = getUnitByStatValue('flexibility', 3);
      const friendlyUnit1 = createUnitInstance('black', flexibleUnitType, 1);
      const friendlyUnit2 = createUnitInstance('black', flexibleUnitType, 2);
      const board = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'northWest' },
        { unit: friendlyUnit1, coordinate: 'D-5', facing: 'north' },
        { unit: friendlyUnit2, coordinate: 'E-4', facing: 'east' },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: 'E-5',
        facing: 'northWest',
      });

      expect(hasMove(legalMoves, 'D-4')).toBe(true);
    });
  });

  describe('with enemy units on board', () => {
    it('should be able to engage enemy unit from flank', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'E-4';
      const startingFacing = 'east';
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
        { unit: enemyUnit, coordinate: 'E-5', facing: 'north' },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      expect(hasMove(legalMoves, 'E-5')).toBe(true);
    });

    it('should be able to engage enemy unit from front with correct facing', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'D-5';
      const startingFacing = 'south';
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
        { unit: enemyUnit, coordinate: 'E-5', facing: 'north' },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      expect(hasMove(legalMoves, 'E-5')).toBe(true);
    });

    it('should be able to engage enemy unit from front with flexibility to rotate', () => {
      // Use stat-based lookup: flexibility 2 (Swordsmen)
      const flexibleUnitType = getUnitByStatValue('flexibility', 2);
      const unit = createUnitInstance('black', flexibleUnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'D-5';
      const startingFacing = 'east';
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 1);
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
        { unit: enemyUnit, coordinate: 'E-5', facing: 'north' },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      expect(hasMove(legalMoves, 'E-5', 'south')).toBe(true);
    });

    it('should not be able to move through enemy unit', () => {
      const friendlyUnit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const enemyUnit1 = createUnitInstance('white', flexibility1UnitType, 1);
      const enemyUnit2 = createUnitInstance('white', flexibility1UnitType, 2);
      const enemyUnit3 = createUnitInstance('white', flexibility1UnitType, 3);
      const board = createBoardWithUnits([
        {
          unit: friendlyUnit,
          coordinate: startingCoordinate,
          facing: startingFacing,
        },
        { unit: enemyUnit1, coordinate: 'D-4', facing: 'south' },
        { unit: enemyUnit2, coordinate: 'D-5', facing: 'south' },
        { unit: enemyUnit3, coordinate: 'D-6', facing: 'south' },
      ]);

      const legalMoves = getLegalUnitMoves(friendlyUnit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Cannot move through enemy unit
      expect(hasMove(legalMoves, 'C-5')).toBe(false);
      // Can move into enemy unit
      expect(hasMove(legalMoves, 'D-5', 'north')).toBe(true);
      // Cannot move into enemy unit with incorrect facing
      expect(hasMove(legalMoves, 'D-5', 'east')).toBe(false);
      // Cannot move into enemy unit with incorrect facing
      expect(hasMove(legalMoves, 'D-5', 'southWest')).toBe(false);
    });

    it('should not be able to move diagonally between two enemy units', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const enemy1 = createUnitInstance('white', flexibility1UnitType, 1);
      const enemy2 = createUnitInstance('white', flexibility1UnitType, 2);
      const board = createBoardWithUnits([
        { unit, coordinate: 'E-5', facing: 'northWest' },
        { unit: enemy1, coordinate: 'D-5', facing: 'south' },
        { unit: enemy2, coordinate: 'E-4', facing: 'east' },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: 'E-5',
        facing: 'northWest',
      });

      expect(hasMove(legalMoves, 'D-4')).toBe(false);
    });
  });

  describe('edge of board (out of bounds forward space)', () => {
    it('should handle unit at edge of board where forward space is undefined', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'A-1';
      const startingFacing = 'north'; // Moving north from A-1 is out of bounds
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Unit can still change facing and move in other directions
      // Should not crash when forwardCoordinate is undefined
      expect(legalMoves.size).toBeGreaterThan(0);
      // Should include the starting position (can stay in place)
      expect(hasMove(legalMoves, startingCoordinate, startingFacing)).toBe(
        true,
      );
      // Should not include spaces north of A-1 (out of bounds)
      expect(hasMove(legalMoves, 'A-0' as StandardBoardCoordinate)).toBe(false);
    });

    it('should handle unit at different edge with undefined forward space', () => {
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'L-18';
      const startingFacing = 'south'; // Moving south from L-18 is out of bounds
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
      ]);

      const legalMoves = getLegalUnitMoves(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should not crash and should return valid moves
      expect(legalMoves.size).toBeGreaterThan(0);
      expect(hasMove(legalMoves, startingCoordinate, startingFacing)).toBe(
        true,
      );
    });
  });

  describe('error cases for invalid starting position', () => {
    it('should throw error when unit at starting position is not free to move (engaged)', () => {
      // Test coverage for lines 29-30: unit is not free to move (engaged state)
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const enemyUnit = createUnitInstance('white', flexibility1UnitType, 2);
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: startingFacing },
        { unit: enemyUnit, coordinate: startingCoordinate, facing: 'south' },
      ]);
      // Manually set the unit presence to engaged state
      board.board[startingCoordinate].unitPresence = {
        presenceType: 'engaged',
        primaryUnit: unit,
        primaryFacing: startingFacing,
        secondaryUnit: enemyUnit,
      };

      expect(() => {
        getLegalUnitMoves(unit, board, {
          coordinate: startingCoordinate,
          facing: startingFacing,
        });
      }).toThrow(new Error('Unit at starting position is not free to move'));
    });

    it('should throw error when unit at starting position is not free to move (none presence)', () => {
      // Test coverage for lines 29-30: unit is not free to move (none presence type)
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createEmptyStandardBoard();
      // Set unit presence to "none" instead of "single"
      board.board[startingCoordinate].unitPresence = {
        presenceType: 'none',
      };

      expect(() => {
        getLegalUnitMoves(unit, board, {
          coordinate: startingCoordinate,
          facing: startingFacing,
        });
      }).toThrow(new Error('Unit at starting position is not free to move'));
    });

    it('should throw error when unit is not present at the starting position', () => {
      // Test coverage for lines 33-34: unit mismatch at starting position
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const differentUnit = createUnitInstance(
        'black',
        flexibility1UnitType,
        2,
      );
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithUnits([
        {
          unit: differentUnit,
          coordinate: startingCoordinate,
          facing: startingFacing,
        },
      ]);

      expect(() => {
        getLegalUnitMoves(unit, board, {
          coordinate: startingCoordinate,
          facing: startingFacing,
        });
      }).toThrow(new Error('Unit is not present at the starting position'));
    });

    it('should throw error when reported facing is inaccurate', () => {
      // Test coverage for lines 37-38: facing mismatch at starting position
      const unit = createUnitInstance('black', flexibility1UnitType, 1);
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const actualFacing = 'north';
      const reportedFacing = 'south'; // Different from actual facing
      const board = createBoardWithUnits([
        { unit, coordinate: startingCoordinate, facing: actualFacing },
      ]);

      expect(() => {
        getLegalUnitMoves(unit, board, {
          coordinate: startingCoordinate,
          facing: reportedFacing,
        });
      }).toThrow(new Error('Reported facing is inaccurate'));
    });
  });
});
