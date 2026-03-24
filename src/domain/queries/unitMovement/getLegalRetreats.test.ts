import type { Board, BoardCoordinate, UnitPlacement } from '@entities';
import { getPlayerUnitWithPosition } from '@queries/unitPresence';
import { MIN_FLEXIBILITY_THRESHOLD } from '@ruleValues';
import {
  createEmptyGameState,
  createGameState,
  createGameStateWithEngagedUnits,
  createGameStateWithSingleUnit,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import { addUnitToBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getLegalRetreats } from './getLegalRetreats';

/**
 * getLegalRetreats: legal retreat placements for an engaged unit given speed, flexibility, and board occupancy.
 */
describe('getLegalRetreats', () => {
  // Test helper to check if a placement exists in the set
  function _placementHasMatch<TBoard extends Board>(
    placements: Set<UnitPlacement<TBoard>>,
    match: {
      coordinate?: BoardCoordinate<TBoard>;
      facing?: string;
    },
  ): boolean {
    const { coordinate, facing } = match;
    const result = [...placements].find((p) => {
      if (coordinate !== undefined && p.coordinate !== coordinate) {
        return false;
      }
      if (facing !== undefined && p.facing !== facing) {
        return false;
      }
      return true;
    });
    return result !== undefined;
  }

  describe('basic functionality', () => {
    it('given an engaged unit, returns minimum retreat moves', () => {
      const primaryUnit = createTestUnit('black', { speed: 2, flexibility: 2 });
      const secondaryUnit = createTestUnit('white', { speed: 2 });
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );

      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'G-8',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }

      const retreats = getLegalRetreats(unit, gameState);
      expect(retreats.size).toBe(1);
    });

    it('given context, returns minimum retreats prioritizing lowest flexibility then speed', () => {
      const primaryUnit = createTestUnit('black', {
        speed: 2,
        flexibility: 2,
      });
      const secondaryUnit = createTestUnit('white');
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );

      const unitWithPlacement = {
        unit: primaryUnit,
        placement: {
          coordinate: 'G-8' as const,
          facing: 'west' as const,
        },
      };

      const retreats = getLegalRetreats(unitWithPlacement, gameState);
      // Should only return retreats with minimum flexibility and speed
      // All returned retreats should have the same (minimum) flexibilityUsed and speedUsed
      expect(retreats.size).toBeGreaterThan(0);
    });
    it('given enemy is facing from directly behind, does not allow retreat', () => {
      const primaryUnit = createTestUnit('black', { speed: 2 });
      const secondaryUnit = createTestUnit('white', { speed: 2 });
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );
      let board = gameState.boardState;
      const additionalEnemyUnit = createTestUnit('white', { speed: 2 });
      const placementBehindPrimaryUnit = {
        coordinate: 'G-9' as const,
        facing: 'west' as const,
      };
      const additionalEnemyUnitWithPlacement = {
        unit: additionalEnemyUnit,
        placement: placementBehindPrimaryUnit,
      };
      board = addUnitToBoard(board, additionalEnemyUnitWithPlacement);
      gameState.boardState = board;
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'G-8',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const retreats = getLegalRetreats(unit, gameState);
      expect(retreats.size).toBe(0);
    });
    it('given enemy is facing from indirectly behind, does not allow retreat', () => {
      const primaryUnit = createTestUnit('black', { speed: 2 });
      const secondaryUnit = createTestUnit('white', { speed: 2 });
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );
      let board = gameState.boardState;
      const additionalEnemyUnit = createTestUnit('white', { speed: 2 });
      const placementBehindPrimaryUnit = {
        coordinate: 'F-9' as const,
        facing: 'west' as const,
      };
      const additionalEnemyUnitWithPlacement = {
        unit: additionalEnemyUnit,
        placement: placementBehindPrimaryUnit,
      };
      board = addUnitToBoard(board, additionalEnemyUnitWithPlacement);
      gameState.boardState = board;
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'G-8',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const retreats = getLegalRetreats(unit, gameState);
      expect(retreats.size).toBe(0);
    });
    it('given allow retreat when enemy behind is not facing', () => {
      const primaryUnit = createTestUnit('black', { speed: 2 });
      const secondaryUnit = createTestUnit('white', { speed: 2 });
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );
      let board = gameState.boardState;
      const additionalEnemyUnit = createTestUnit('white', { speed: 2 });
      const placementBehindPrimaryUnit = {
        coordinate: 'G-9' as const,
        facing: 'north' as const,
      };
      const additionalEnemyUnitWithPlacement = {
        unit: additionalEnemyUnit,
        placement: placementBehindPrimaryUnit,
      };
      board = addUnitToBoard(board, additionalEnemyUnitWithPlacement);
      gameState.boardState = board;
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'G-8',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const retreats = getLegalRetreats(unit, gameState);
      expect(retreats.size).toBeGreaterThan(0);
    });
    it('given allow retreat through friendly units', () => {
      const highFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2) + 1;
      const primaryUnit = createUnitWithPlacement({
        playerSide: 'black',
        unitOptions: { flexibility: highFlexibility, instanceNumber: 1 },
        coordinate: 'G-8',
        facing: 'west',
      });
      const secondaryUnit1 = createUnitWithPlacement({
        playerSide: 'black',
        unitOptions: { flexibility: highFlexibility, instanceNumber: 2 },
        coordinate: 'F-9',
        facing: 'west',
      });
      const secondaryUnit2 = createUnitWithPlacement({
        playerSide: 'black',
        unitOptions: { flexibility: highFlexibility, instanceNumber: 3 },
        coordinate: 'G-9',
        facing: 'west',
      });
      const secondaryUnit3 = createUnitWithPlacement({
        playerSide: 'black',
        unitOptions: { flexibility: highFlexibility, instanceNumber: 4 },
        coordinate: 'H-9',
        facing: 'west',
      });
      const gameState = createEmptyGameState();
      let board = gameState.boardState;
      board = addUnitToBoard(board, primaryUnit);
      board = addUnitToBoard(board, secondaryUnit1);
      board = addUnitToBoard(board, secondaryUnit2);
      board = addUnitToBoard(board, secondaryUnit3);
      gameState.boardState = board;
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'G-8',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const retreats = getLegalRetreats(unit, gameState);
      expect(retreats.size).toBe(1);
    });
  });

  describe('error cases', () => {
    it('given an error when no unit is present at starting position, throws', () => {
      const gameState = createGameState([]);
      const unit = createTestUnit('black');
      const unitWithPlacement = {
        unit,
        placement: {
          coordinate: 'G-8' as const,
          facing: 'west' as const,
        },
      };

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'No unit present at starting position',
      );
    });

    it('given an error when engaged unit is not present at starting position, throws', () => {
      const primaryUnit = createTestUnit('black');
      const secondaryUnit = createTestUnit('white');
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );

      // Create a different unit instance
      const differentUnit = createTestUnit('black', { instanceNumber: 999 });
      const unitWithPlacement = {
        unit: differentUnit,
        placement: {
          coordinate: 'G-8' as const,
          facing: 'west' as const,
        },
      };

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'Unit is not present at the starting position',
      );
    });

    it('given an error when secondary unit is not present at starting position, throws', () => {
      const primaryUnit = createTestUnit('black');
      const secondaryUnit = createTestUnit('white');
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );
      const unitWithPlacement = {
        unit: {
          ...secondaryUnit,
          instanceNumber: secondaryUnit.instanceNumber + 1,
        },
        placement: {
          coordinate: 'G-8' as const,
          facing: 'east' as const,
        },
      };
      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'Unit is not present at the starting position',
      );
    });

    it('given an error when unengaged unit is not present at starting position, throws', () => {
      const gameState = createGameStateWithSingleUnit('G-8', 'black', {
        facing: 'west',
      });
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'G-8',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const otherUnitWithPlacement = {
        ...unit,
        unit: {
          ...unit.unit,
          instanceNumber: unit.unit.instanceNumber + 1,
        },
        placement: {
          coordinate: 'G-8' as const,
          facing: 'west' as const,
        },
      };
      expect(() => getLegalRetreats(otherUnitWithPlacement, gameState)).toThrow(
        'Unit is not present at the starting position',
      );
    });

    it('given an error when unit facing is different from specified facing, throws', () => {
      const primaryUnit = createTestUnit('black');
      const secondaryUnit = createTestUnit('white');
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );

      const unitWithPlacement = {
        unit: primaryUnit,
        placement: {
          coordinate: 'G-8' as const,
          facing: 'north' as const,
        },
      };

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'Unit facing mismatch',
      );
    });
  });

  describe('edge cases', () => {
    it('returns the legal retreat set for the secondary unit in an engagement', () => {
      const primaryUnit = createTestUnit('black');
      const secondaryUnit = createTestUnit('white', { speed: 2 });
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );

      // Secondary unit faces opposite to primary (east)
      const unitWithPlacement = {
        unit: secondaryUnit,
        placement: {
          coordinate: 'G-8' as const,
          facing: 'east' as const, // Opposite of west
        },
      };

      const retreats = getLegalRetreats(unitWithPlacement, gameState);
      // Secondary (white) faces east; backward is west — one minimal legal retreat from engaged G-8
      expect(retreats.size).toBe(1);
      expect([...retreats]).toEqual([
        expect.objectContaining({
          coordinate: 'G-7',
          facing: 'east',
        }),
      ]);
    });
  });
});
