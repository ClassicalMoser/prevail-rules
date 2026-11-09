import {
  getPlayerUnitWithPosition,
  getSingleUnitWithPlacementAtCoordinate,
} from '@queries';
import { throwIfUndefined } from '@utils';
import type { Coordinate, UnitPlacement } from '@entities';
import { MIN_FLEXIBILITY_THRESHOLD } from '@ruleValues';
import {
  createGameState,
  createGameStateWithEngagedUnits,
  createGameStateWithSingleUnit,
  createTestUnit,
  createUnitWithPlacement,
  placed,
} from '@testing';
import { addUnitToBoard } from '@transforms';

import { getLegalRetreats } from './getLegalRetreats';

import { createEmptyGameState } from '@factories';
/**
 * GetLegalRetreats: legal retreat placements for an engaged unit given speed, flexibility, and board occupancy.
 */
describe('getLegalRetreats function', () => {
  // Test helper to check if a placement exists in the set
  function _placementHasMatch(
    placements: Set<UnitPlacement>,
    match: {
      coordinate?: Coordinate;
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
      const primaryUnit = createTestUnit('black', { flexibility: 2, speed: 2 });
      const secondaryUnit = createTestUnit('white', { speed: 2 });
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );

      // The black unit is one of two in an engaged space, which only the
      // side-aware lookup can pick out.
      const unit = throwIfUndefined(
        getPlayerUnitWithPosition(gameState.boardState, 'G-8', 'black'),
        'Unit not found',
      );

      const retreats = getLegalRetreats(unit, gameState);
      expect(retreats.size).toBe(1);
    });

    it('given context, returns minimum retreats prioritizing lowest flexibility then speed', () => {
      const primaryUnit = createTestUnit('black', {
        flexibility: 2,
        speed: 2,
      });
      const secondaryUnit = createTestUnit('white');
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'G-8',
        'west',
      );

      const unitWithPlacement = placed(primaryUnit, 'G-8', 'west');

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
        placement: placementBehindPrimaryUnit,
        unit: additionalEnemyUnit,
      };
      board = addUnitToBoard(board, additionalEnemyUnitWithPlacement);
      gameState.boardState = board;
      // The black unit is one of two in an engaged space, which only the
      // side-aware lookup can pick out.
      const unit = throwIfUndefined(
        getPlayerUnitWithPosition(gameState.boardState, 'G-8', 'black'),
        'Unit not found',
      );
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
        placement: placementBehindPrimaryUnit,
        unit: additionalEnemyUnit,
      };
      board = addUnitToBoard(board, additionalEnemyUnitWithPlacement);
      gameState.boardState = board;
      // The black unit is one of two in an engaged space, which only the
      // side-aware lookup can pick out.
      const unit = throwIfUndefined(
        getPlayerUnitWithPosition(gameState.boardState, 'G-8', 'black'),
        'Unit not found',
      );
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
        placement: placementBehindPrimaryUnit,
        unit: additionalEnemyUnit,
      };
      board = addUnitToBoard(board, additionalEnemyUnitWithPlacement);
      gameState.boardState = board;
      // The black unit is one of two in an engaged space, which only the
      // side-aware lookup can pick out.
      const unit = throwIfUndefined(
        getPlayerUnitWithPosition(gameState.boardState, 'G-8', 'black'),
        'Unit not found',
      );
      const retreats = getLegalRetreats(unit, gameState);
      expect(retreats.size).toBeGreaterThan(0);
    });

    it('given allow retreat through friendly units', () => {
      const highFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2) + 1;
      const primaryUnit = createUnitWithPlacement({
        coordinate: 'G-8',
        facing: 'west',
        playerSide: 'black',
        unitOptions: { flexibility: highFlexibility, instanceNumber: 1 },
      });
      const secondaryUnit1 = createUnitWithPlacement({
        coordinate: 'F-9',
        facing: 'west',
        playerSide: 'black',
        unitOptions: { flexibility: highFlexibility, instanceNumber: 2 },
      });
      const secondaryUnit2 = createUnitWithPlacement({
        coordinate: 'G-9',
        facing: 'west',
        playerSide: 'black',
        unitOptions: { flexibility: highFlexibility, instanceNumber: 3 },
      });
      const secondaryUnit3 = createUnitWithPlacement({
        coordinate: 'H-9',
        facing: 'west',
        playerSide: 'black',
        unitOptions: { flexibility: highFlexibility, instanceNumber: 4 },
      });
      const gameState = createEmptyGameState('standard');
      let board = gameState.boardState;
      board = addUnitToBoard(board, primaryUnit);
      board = addUnitToBoard(board, secondaryUnit1);
      board = addUnitToBoard(board, secondaryUnit2);
      board = addUnitToBoard(board, secondaryUnit3);
      gameState.boardState = board;
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'G-8',
      );
      const retreats = getLegalRetreats(unit, gameState);
      expect(retreats.size).toBe(1);
    });
  });

  describe('error cases', () => {
    it('given an error when no unit is present at starting position, throws', () => {
      const gameState = createGameState([]);
      const unit = createTestUnit('black');
      const unitWithPlacement = placed(unit, 'G-8', 'west');

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'No friendly unit at coordinate',
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
      const unitWithPlacement = placed(differentUnit, 'G-8', 'west');

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'Unit is not at the placement',
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
      const absentSecondary = {
        ...secondaryUnit,
        instanceNumber: secondaryUnit.instanceNumber + 1,
      };
      const unitWithPlacement = placed(absentSecondary, 'G-8', 'east');
      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'Unit is not at the placement',
      );
    });

    it('given an error when unengaged unit is not present at starting position, throws', () => {
      const gameState = createGameStateWithSingleUnit('G-8', 'black', {
        facing: 'west',
      });
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'G-8',
      );
      const absentInstance = {
        ...unit.unit,
        instanceNumber: unit.unit.instanceNumber + 1,
      };
      const otherUnitWithPlacement = placed(absentInstance, 'G-8', 'west');
      expect(() => getLegalRetreats(otherUnitWithPlacement, gameState)).toThrow(
        'Unit is not at the placement',
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

      const unitWithPlacement = placed(primaryUnit, 'G-8', 'north');

      expect(() => getLegalRetreats(unitWithPlacement, gameState)).toThrow(
        'Declared facing does not match facing of unit present',
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
      const unitWithPlacement = placed(
        secondaryUnit,
        'G-8',
        'east', // Opposite of west
      );

      const retreats = getLegalRetreats(unitWithPlacement, gameState);
      // Secondary (white) faces east; backward is west — one minimal legal retreat from engaged G-8
      expect(retreats.size).toBe(1);
      expect([...retreats]).toStrictEqual([
        expect.objectContaining({
          coordinate: 'G-7',
          facing: 'east',
        }),
      ]);
    });
  });
});
