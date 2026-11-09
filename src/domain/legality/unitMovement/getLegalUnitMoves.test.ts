import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
  createUnitWithPlacement,
  hasMove,
  placed,
} from '@testing';

import { getLegalUnitMoves } from './getLegalUnitMoves';

/**
 * GetLegalUnitMoves: every ending an ordered move may reach, each with the
 * path a player submits to make it (A11).
 */
describe('getLegalUnitMoves function', () => {
  describe('basic functionality', () => {
    it('given context, returns legal moves including starting position', () => {
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'D-7',
      );

      const moves = getLegalUnitMoves(unit, gameState);
      expect(hasMove(moves, 'D-7', 'southEast')).toBe(true);
    });

    it('each legal move carries the path that makes it', () => {
      // A lone unit on E-5 facing north; one step ahead reaches D-5.
      const gameState = createGameState([['E-5', 'black', 'north']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const moves = getLegalUnitMoves(unit, gameState);
      const stepAhead = [...moves].find(
        (move) =>
          move.placement.coordinate === 'D-5' &&
          move.placement.facing === 'north' &&
          move.speedUsed === 1,
      );

      expect(stepAhead?.path).toStrictEqual(['step']);
    });
  });

  describe('error cases', () => {
    it('given an error when unit is not present at starting position, throws', () => {
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'D-7',
      );

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

    it('given an error when no unit is specified at the coordinate, throws', () => {
      const gameState = createGameState([]);
      const unitWithPlacement = createUnitWithPlacement({
        coordinate: 'D-7',
        facing: 'southEast',
        playerSide: 'black',
      });

      expect(() => getLegalUnitMoves(unitWithPlacement, gameState)).toThrow(
        'No movable unit at starting position',
      );
    });

    it('given an error when unit is not at the specified placement coordinate, throws', () => {
      const gameState = createGameState([['E-7', 'black', 'southEast']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-7',
      );

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

    it('given an error when unit facing is different from specified facing, throws', () => {
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'D-7',
      );

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

    it('given an error when unit is engaged, throws', () => {
      const primaryUnit = createTestUnit('black');
      const secondaryUnit = createTestUnit('white');
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'D-7',
        'southEast',
      );

      const unitWithPlacement = placed(primaryUnit, 'D-7', 'southEast');

      expect(() => getLegalUnitMoves(unitWithPlacement, gameState)).toThrow(
        'No movable unit at starting position',
      );
    });
  });
});
