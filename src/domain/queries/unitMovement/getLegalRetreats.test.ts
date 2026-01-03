import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitPlacement,
} from '@entities';
import {
  createBoardWithEngagedUnits,
  createSingleUnitPresence,
  createTestUnit,
  getUnitByStatValue,
} from '@testing';
import { createEmptySmallBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getLegalRetreats } from './getLegalRetreats';

describe('getLegalRetreats', () => {
  describe('basic retreat scenarios', () => {
    it('should find simple backward retreat with no facing change', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should retreat backward (south) to F-5
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-5',
        facing: 'north',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });

    it('should find simple diagonal backward retreat with no facing change', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'northEast';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-4',
        facing: 'northEast',
      });

      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });

    it('should find retreat with one facing change when direct backward is blocked', () => {
      const unit = createTestUnit('black', { flexibility: 1, speed: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );
      // Block the direct backward path
      board.board['F-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 2 }),
        facing: 'north',
      };

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // With speed 1 and flexibility 1, and F-5 blocked, we can retreat to spaces behind
      // Starting at E-5 facing north, behind means south (F row and beyond)
      // Only F-4 and F-6 are behind and reachable with one facing change
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({ coordinate: 'F-4', facing: 'northEast' });
      expectedRetreats.add({ coordinate: 'F-6', facing: 'northWest' });

      // Should get the legal retreats
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });
  });

  describe('retreat prioritization (lowest cost first)', () => {
    it('should prioritize no facing change over one facing change', () => {
      const unit = createTestUnit('black', { flexibility: 3, speed: 3 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      // Block direct backward with a friendly unit
      board.board['F-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', {
          flexibility: 3,
          speed: 3,
          instanceNumber: 2,
        }),
        facing: 'north',
      };

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Direct backward retreat (G-5, north) should be found
      // This uses flexibility=0, speed=2
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'G-5',
        facing: 'north',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });

    it('should prioritize lower speed over higher speed', () => {
      const unit = createTestUnit('black', { flexibility: 1, speed: 2 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should find speed=1 retreats before speed=2 retreats
      // All returned retreats should be at the minimum cost level
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-5',
        facing: 'north',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });

    it('should find retreats with one facing change when direct path requires it', () => {
      // Use a unit with flexibility 1, place it so direct backward is blocked
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );
      // Block direct backward
      board.board['F-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 2 }),
        facing: 'north',
      };
      // Block diagonal backward (F-4 and F-6)
      board.board['F-4'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 3 }),
        facing: 'north',
      };

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-6',
        facing: 'northWest',
      });

      // Should find the closest retreat
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });
  });

  describe('retreat near enemies', () => {
    it('should not retreat when enemy is facing us from behind', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );
      // Place enemy unit behind us, facing toward us
      board.board['F-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('white', { flexibility: 1, instanceNumber: 2 }),
        facing: 'north', // Facing toward E-5 (our starting position)
      };

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // If an enemy is facing us from behind, we cannot retreat at all
      expect(retreats.size).toBe(0);
    });

    it('should allow retreat when enemy behind us is not facing us', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );
      // Place enemy unit behind us, but facing away from us
      board.board['F-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('white', { flexibility: 1, instanceNumber: 2 }),
        facing: 'south', // Facing away from E-5
      };

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should be able to retreat to other spaces (not F-5 since enemy is there)
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      // Verify F-5 is not in the results
      for (const placement of actualPlacements) {
        expect(placement.coordinate).not.toBe('F-5');
      }
      // And verify we got some valid retreats
      expect(actualPlacements.size).toBeGreaterThan(0);
    });

    it('should only retreat to empty spaces', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // All retreat destinations should be empty
      for (const retreat of retreats) {
        const space = board.board[retreat.placement.coordinate];
        expect(space.unitPresence.presenceType).toBe('none');
      }
    });
  });

  describe('units can retreat whether engaged or not', () => {
    it('should allow retreat when unit is not engaged (single unit)', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      // Create empty small board
      const board = createEmptySmallBoard();
      // Add single unit (not engaged)
      board.board[startingCoordinate].unitPresence = createSingleUnitPresence(
        unit,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-5',
        facing: 'north',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });

    it('should allow retreat when unit is engaged as primary', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      expect(retreats.size).toBeGreaterThan(0);
    });

    it('should allow retreat when unit is engaged as secondary', () => {
      const unit = createTestUnit('white', { flexibility: 1 });
      const enemyUnit = createTestUnit('black', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'south'; // Secondary unit faces opposite
      const board = createBoardWithEngagedUnits(
        enemyUnit, // primary
        unit, // secondary
        startingCoordinate,
        'north', // primary facing
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      expect(retreats.size).toBeGreaterThan(0);
    });
  });

  describe('error cases', () => {
    it('should throw error when unit is not present at starting position', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const differentUnit = createTestUnit('black', {
        flexibility: 1,
        instanceNumber: 2,
      });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        differentUnit, // Different unit
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      expect(() => {
        getLegalRetreats(unit, board, {
          coordinate: startingCoordinate,
          facing: startingFacing,
        });
      }).toThrow(new Error('Unit is not present at the starting position'));
    });

    it('should throw error when reported facing is inaccurate', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const actualFacing = 'north';
      const reportedFacing = 'south'; // Different from actual
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        actualFacing,
      );

      expect(() => {
        getLegalRetreats(unit, board, {
          coordinate: startingCoordinate,
          facing: reportedFacing,
        });
      }).toThrow(new Error('Reported facing is inaccurate'));
    });
  });

  describe('different facing directions', () => {
    it('should retreat backward when facing east', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'east';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should retreat west (backward from east) to E-4
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'E-4',
        facing: 'east',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });

    it('should retreat backward when facing south', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'south';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should retreat north (backward from south) to D-5
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'D-5',
        facing: 'south',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });

    it('should retreat backward when facing diagonal', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'northEast';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-4',
        facing: 'northEast',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });
  });

  describe('edge cases', () => {
    it('should handle unit at edge of board where backward space is undefined', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'A-15';
      const startingFacing = 'south'; // Backward (south) from A-1 is out of bounds
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // If no retreat is possible, should return empty set
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expect(retreats).toEqual(expectedRetreats);
    });

    it('should return empty set when no retreat is possible', () => {
      const unit = createTestUnit('black', { flexibility: 1, speed: 2 });
      const enemyUnit = createTestUnit('white', { flexibility: 1, speed: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );
      // Block all possible retreat paths - need to block more comprehensively
      // Block direct backward and all adjacent spaces
      const blockedSpaces: StandardBoardCoordinate[] = [
        'F-5', // Direct backward
        'F-4', // Diagonal backward (northWest)
        'F-6', // Diagonal backward (northEast)
        'G-5', // Further backward
        'G-4', // Further diagonal backward
        'G-6', // Further diagonal backward
      ];
      for (const space of blockedSpaces) {
        if (board.board[space]) {
          board.board[space].unitPresence = {
            presenceType: 'single',
            unit: createTestUnit('black', {
              flexibility: 1,
              speed: 2,
              instanceNumber: 2,
            }),
            facing: 'north',
          };
        }
      }

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should return empty set when no retreat is possible
      expect(retreats.size).toBe(0);
    });

    it('should handle units with different speed values', () => {
      const unit = createTestUnit('black', { flexibility: 1, speed: 3 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should find minimum cost retreats (speed=1, flexibility=0)
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-5',
        facing: 'north',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });

    it('should handle units with different flexibility values', () => {
      const flexibleUnitType = getUnitByStatValue('flexibility', 2);
      const unit = createTestUnit('black', { unitType: flexibleUnitType });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      // Should prioritize lowest flexibility first
      // Direct backward should be found (flexibility=0)
      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-5',
        facing: 'north',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });
  });

  describe('retreat with facing changes', () => {
    it('should find retreats that require facing change when direct path is blocked', () => {
      const unit = createTestUnit('black', { flexibility: 1 });
      const enemyUnit = createTestUnit('white', { flexibility: 1 });
      const startingCoordinate: StandardBoardCoordinate = 'E-5';
      const startingFacing = 'north';
      const board = createBoardWithEngagedUnits(
        unit,
        enemyUnit,
        startingCoordinate,
        startingFacing,
      );

      board.board['F-5'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 2 }),
        facing: 'north',
      };
      board.board['F-6'].unitPresence = {
        presenceType: 'single',
        unit: createTestUnit('black', { flexibility: 1, instanceNumber: 4 }),
        facing: 'north',
      };

      const retreats = getLegalRetreats(unit, board, {
        coordinate: startingCoordinate,
        facing: startingFacing,
      });

      const expectedRetreats = new Set<UnitPlacement<StandardBoard>>();
      expectedRetreats.add({
        coordinate: 'F-4',
        facing: 'northEast',
      });
      const actualPlacements = new Set(
        Array.from(retreats).map((r) => r.placement),
      );
      expect(actualPlacements).toEqual(expectedRetreats);
    });
  });
});
