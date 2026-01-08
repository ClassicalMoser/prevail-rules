import type { Board, BoardCoordinate, UnitPlacement } from '@entities';
import { getPlayerUnitWithPosition } from '@queries/unitPresence';
import {
  createGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
  createUnitWithPlacement,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getLegalUnitMoves } from './getLegalUnitMoves';

describe('getLegalUnitMoves', () => {
  // Test helper to check if a placement exists in the set
  function placementHasMatch<TBoard extends Board>(
    placements: Set<UnitPlacement<TBoard>>,
    match: {
      coordinate?: BoardCoordinate<TBoard>;
      facing?: string;
    },
  ): boolean {
    const { coordinate, facing } = match;
    const result = Array.from(placements).find((p) => {
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
    it('should return legal moves including starting position', () => {
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'D-7',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }

      const moves = getLegalUnitMoves(unit, gameState);
      const hasStartingPosition = placementHasMatch(moves, {
        coordinate: 'D-7',
        facing: 'southEast',
      });
      expect(hasStartingPosition).toBe(true);
    });
  });

  describe('error cases', () => {
    it('should throw an error when unit is not present at starting position', () => {
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'D-7',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }

      const differentUnit = {
        ...unit,
        unit: {
          ...unit.unit,
          instanceNumber: unit.unit.instanceNumber + 1,
        },
      };
      expect(() => getLegalUnitMoves(differentUnit, gameState)).toThrow(
        'Unit is not present at the starting position',
      );
    });
    it('should throw an error when no unit is specified at the coordinate', () => {
      const gameState = createGameState([]);
      const unitWithPlacement = createUnitWithPlacement({
        playerSide: 'black',
        coordinate: 'D-7',
        facing: 'southEast',
      });

      expect(() => getLegalUnitMoves(unitWithPlacement, gameState)).toThrow(
        'No movable unit at starting position',
      );
    });

    it('should throw an error when unit is not at the specified placement coordinate', () => {
      const gameState = createGameState([['E-7', 'black', 'southEast']]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-7',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }

      // Create a unitWithPlacement with the unit but wrong coordinate
      const unitWithWrongCoordinate = {
        ...unit,
        placement: {
          ...unit.placement,
          coordinate: 'D-7' as const,
        },
      };

      expect(() =>
        getLegalUnitMoves(unitWithWrongCoordinate, gameState),
      ).toThrow('No movable unit at starting position');
    });

    it('should throw an error when unit facing is different from specified facing', () => {
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'D-7',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }

      // Create a unitWithPlacement with incorrect facing
      const unitWithWrongFacing = {
        ...unit,
        placement: {
          ...unit.placement,
          facing: 'north' as const,
        },
      };

      expect(() => getLegalUnitMoves(unitWithWrongFacing, gameState)).toThrow(
        'Reported facing is inaccurate',
      );
    });

    it('should throw an error when unit is engaged', () => {
      const primaryUnit = createTestUnit('black');
      const secondaryUnit = createTestUnit('white');
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'D-7',
        'southEast',
      );

      const unitWithPlacement = {
        unit: primaryUnit,
        placement: {
          coordinate: 'D-7' as const,
          facing: 'southEast' as const,
        },
      };

      expect(() => getLegalUnitMoves(unitWithPlacement, gameState)).toThrow(
        'No movable unit at starting position',
      );
    });
  });
});
