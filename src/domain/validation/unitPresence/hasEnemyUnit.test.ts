import type {
  BoardSpace,
  SingleUnitPresence,
  UnitPresenceType,
} from '@entities';
import {
  createBoardWithEngagedUnits,
  createBoardWithSingleUnit,
  createTestUnit,
} from '@testing';
import { createEmptyStandardBoard } from '@transforms';

import { hasEnemyUnit } from './hasEnemyUnit';

/**
 * HasEnemyUnit: Checks if an enemy unit is found in the space.
 */
describe(hasEnemyUnit, () => {
  const coordinate = 'E-5';

  describe('none unit presence', () => {
    it('given there is no unit, returns false', () => {
      const board = createEmptyStandardBoard();
      const space: BoardSpace = board.board[coordinate];
      const { result: blackResult } = hasEnemyUnit('black', space);
      expect(blackResult).toBeFalsy();
      const { result: whiteResult } = hasEnemyUnit('white', space);
      expect(whiteResult).toBeFalsy();
    });
  });

  describe('single unit presence', () => {
    it('given there is a friendly unit, returns false', () => {
      const board = createBoardWithSingleUnit(coordinate, 'black');
      const space: BoardSpace = board.board[coordinate];
      const { result } = hasEnemyUnit('black', space);
      expect(result).toBeFalsy();
    });

    it('given there is an enemy unit, returns true', () => {
      const board = createBoardWithSingleUnit(coordinate, 'white');
      const space: BoardSpace = board.board[coordinate];
      const { result } = hasEnemyUnit('black', space);
      expect(result).toBeTruthy();
    });

    it('given there is a black enemy unit, returns true for white player', () => {
      const board = createBoardWithSingleUnit(coordinate, 'black');
      const space: BoardSpace = board.board[coordinate];
      const { result } = hasEnemyUnit('white', space);
      expect(result).toBeTruthy();
    });
  });

  describe('engaged unit presence', () => {
    it('given units are engaged (always contains an enemy), returns true', () => {
      const blackUnit = createTestUnit('black', { attack: 3 });
      const whiteUnit = createTestUnit('white', { attack: 3 });
      const board = createBoardWithEngagedUnits(
        blackUnit,
        whiteUnit,
        coordinate,
      );
      const space: BoardSpace = board.board[coordinate];

      // Engaged units always contain an enemy for both sides
      const { result: blackResult } = hasEnemyUnit('black', space);
      expect(blackResult).toBeTruthy();
      const { result: whiteResult } = hasEnemyUnit('white', space);
      expect(whiteResult).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('given unitPresence has invalid type, returns false', () => {
      const board = createEmptyStandardBoard();
      const space: BoardSpace = board.board[coordinate];
      // Use type assertion to bypass TypeScript's type checking and set unitPresence to an invalid value
      // This tests the catch block - validation functions never throw
      (space as any).unitPresence = {
        presenceType: 'invalid' as unknown as UnitPresenceType,
      };

      const { result } = hasEnemyUnit('black', space);
      expect(result).toBeFalsy();
    });

    it('given unitPresence is missing required properties, returns false', () => {
      const board = createEmptyStandardBoard();
      const space: BoardSpace = board.board[coordinate];
      // Create a malformed unitPresence that might cause errors when accessing properties
      space.unitPresence = {
        presenceType: 'single',
        // Missing 'unit' property - would cause error when accessing unit.playerSide
      } as unknown as SingleUnitPresence;

      const { result } = hasEnemyUnit('black', space);
      expect(result).toBeFalsy();
    });
  });
});
