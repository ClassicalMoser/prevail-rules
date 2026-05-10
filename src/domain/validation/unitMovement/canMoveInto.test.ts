import type { StandardBoardCoordinate } from '@entities';
import { createGameState, createTestUnit } from '@testing';
import { addUnitToBoard, createEmptyStandardBoard } from '@transforms';

import { canMoveInto } from './canMoveInto';

/**
 * CanMoveInto: Determines whether a unit can move into (end its movement at) a specific coordinate.
 */
describe(canMoveInto, () => {
  describe('empty space', () => {
    it('given the space has no unit, returns true', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 'north', 0, 'advance'),
      ).toBeTruthy();
    });
  });

  describe('engaged units', () => {
    it('given the space has engaged units, returns false', () => {
      let board = createEmptyStandardBoard();
      // Add engaged units at D-5
      board = addUnitToBoard(board, {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'D-5',
          facing: 'north',
        },
        unit: createTestUnit('black'),
      });
      board = addUnitToBoard(board, {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'D-5',
          facing: 'south',
        },
        unit: createTestUnit('white'),
      });
      // Add unit attempting to move into
      board = addUnitToBoard(board, {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
        unit: createTestUnit('black'),
      });
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 'north', 0, 'advance'),
      ).toBeFalsy();
    });
  });

  describe('friendly units', () => {
    it('given the space has a single friendly unit, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 'north', 0, 'advance'),
      ).toBeFalsy();
    });
  });

  describe('enemy units', () => {
    describe('advance direction', () => {
      it('given enemy can be engaged, returns true', () => {
        // CanMoveInto delegates to canEngageEnemy for advance direction
        // Detailed engagement tests are in canEngageEnemy.test.ts
        const gameState = createGameState([
          { coord: 'E-5', facing: 'south', player: 'black', speed: 2 },
          { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
        ]);
        const board = gameState.boardState;
        expect(
          canMoveInto(
            'black',
            board,
            'D-5',
            'E-5',
            'E-5',
            'south',
            0,
            'advance',
          ),
        ).toBeTruthy();
      });

      it('given enemy cannot be engaged, returns false', () => {
        const gameState = createGameState([
          { coord: 'E-5', facing: 'north', player: 'black' },
          { coord: 'D-5', facing: 'north', player: 'white' },
        ]);
        const board = gameState.boardState;
        expect(
          canMoveInto(
            'black',
            board,
            'D-5',
            'E-5',
            'D-4', // Flank of enemy
            'east',
            0,
            'advance',
          ),
        ).toBeFalsy();
      });
    });

    describe('retreat direction', () => {
      it('given attempting to retreat into enemy unit, returns false', () => {
        const gameState = createGameState([
          { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
          { coord: 'D-5', facing: 'south', player: 'white', speed: 2 },
        ]);
        const board = gameState.boardState;
        expect(
          canMoveInto(
            'black',
            board,
            'D-5',
            'E-5',
            'E-5',
            'north',
            0,
            'retreat',
          ),
        ).toBeFalsy();
      });
    });
  });

  describe('error handling', () => {
    it('given a non-existent coordinate, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const board = gameState.boardState;
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;
      expect(
        canMoveInto(
          'black',
          board,
          invalidCoordinate,
          'E-5',
          'E-5',
          'north',
          0,
          'advance',
        ),
      ).toBeFalsy();
    });

    it('given an invalid unitPresence, returns false', () => {
      let board = createEmptyStandardBoard();
      board = addUnitToBoard(board, {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
        unit: createTestUnit('black'),
      });
      board.board['D-5']!.unitPresence = {
        presenceType: 'invalid' as any, // Bad type assertion to test error case
      };
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 'north', 0, 'advance'),
      ).toBeFalsy();
    });
  });
});
