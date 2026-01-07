import type { StandardBoardCoordinate } from '@entities';
import { createGameState, createTestUnit } from '@testing';
import { addUnitToBoard, createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { canMoveInto } from './canMoveInto';

describe('canMoveInto', () => {
  describe('empty space', () => {
    it('should return true when the space has no unit', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 'north', 0, 'advance'),
      ).toBe(true);
    });
  });

  describe('engaged units', () => {
    it('should return false when the space has engaged units', () => {
      let board = createEmptyStandardBoard();
      // Add engaged units at D-5
      board = addUnitToBoard(board, {
        unit: createTestUnit('black'),
        placement: { coordinate: 'D-5', facing: 'north' },
      });
      board = addUnitToBoard(board, {
        unit: createTestUnit('white'),
        placement: { coordinate: 'D-5', facing: 'south' },
      });
      // Add unit attempting to move into
      board = addUnitToBoard(board, {
        unit: createTestUnit('black'),
        placement: { coordinate: 'E-5', facing: 'north' },
      });
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 'north', 0, 'advance'),
      ).toBe(false);
    });
  });

  describe('friendly units', () => {
    it('should return false when the space has a single friendly unit', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'D-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 'north', 0, 'advance'),
      ).toBe(false);
    });
  });

  describe('enemy units', () => {
    describe('advance direction', () => {
      it('should return true when enemy can be engaged', () => {
        // canMoveInto delegates to canEngageEnemy for advance direction
        // Detailed engagement tests are in canEngageEnemy.test.ts
        const gameState = createGameState([
          { coord: 'E-5', player: 'black', facing: 'south', speed: 2 },
          { coord: 'D-5', player: 'white', facing: 'north', speed: 2 },
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
        ).toBe(true);
      });

      it('should return false when enemy cannot be engaged', () => {
        const gameState = createGameState([
          { coord: 'E-5', player: 'black', facing: 'north' },
          { coord: 'D-5', player: 'white', facing: 'north' },
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
        ).toBe(false);
      });
    });

    describe('retreat direction', () => {
      it('should return false when attempting to retreat into enemy unit', () => {
        const gameState = createGameState([
          { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
          { coord: 'D-5', player: 'white', facing: 'south', speed: 2 },
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
        ).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should return false for a non-existent coordinate', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
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
      ).toBe(false);
    });
    it('should return false for an invalid unitPresence', () => {
      let board = createEmptyStandardBoard();
      board = addUnitToBoard(board, {
        unit: createTestUnit('black'),
        placement: { coordinate: 'E-5', facing: 'north' },
      });
      board.board['D-5']!.unitPresence = {
        presenceType: 'invalid' as any, // Bad type assertion to test error case
      };
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 'north', 0, 'advance'),
      ).toBe(false);
    });
  });
});
