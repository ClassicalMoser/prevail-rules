import type { Coordinate } from '@entities';
import { throwIfUndefined } from '@utils';
import { createGameState, createTestUnit, placed } from '@testing';
import { addUnitToBoard } from '@transforms';
import { createEmptyStandardBoard } from '@factories';

import { canMoveInto } from './canMoveInto';

/**
 * CanMoveInto: Determines whether a unit can move into (end its movement at) a specific coordinate.
 */
describe('canMoveInto function', () => {
  describe('empty space', () => {
    it('given the space has no unit, returns true', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 0, 'advance'),
      ).toBe(true);
    });
  });

  describe('engaged units', () => {
    it('given the space has engaged units, returns false', () => {
      let board = createEmptyStandardBoard();
      // Add engaged units at D-5
      board = addUnitToBoard(
        board,
        placed(createTestUnit('black'), 'D-5', 'north'),
      );
      board = addUnitToBoard(
        board,
        placed(createTestUnit('white'), 'D-5', 'south'),
      );
      // Add unit attempting to move into
      board = addUnitToBoard(
        board,
        placed(createTestUnit('black'), 'E-5', 'north'),
      );
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 0, 'advance'),
      ).toBe(false);
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
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 0, 'advance'),
      ).toBe(false);
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
          canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 0, 'advance'),
        ).toBe(true);
      });

      it('given enemy cannot be engaged, returns false', () => {
        const gameState = createGameState([
          { coord: 'E-5', facing: 'north', player: 'black' },
          { coord: 'D-5', facing: 'north', player: 'white' },
        ]);
        const board = gameState.boardState;
        expect(
          canMoveInto('black', board, 'D-5', 'E-5', 'D-4', 0, 'advance'),
        ).toBe(false);
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
          canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 0, 'retreat'),
        ).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('throws, naming the coordinate, when it is not on the board', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const board = gameState.boardState;
      const invalidCoordinate = 'Z-99' as Coordinate;
      // The caller names a space it has already found, so an absent one is a
      // fault in the caller, not a space a unit cannot end its move on.
      expect(() =>
        canMoveInto(
          'black',
          board,
          invalidCoordinate,
          'E-5',
          'E-5',
          0,
          'advance',
        ),
      ).toThrow('Coordinate Z-99 does not exist on standard board.');
    });

    it('given an invalid unitPresence, returns false', () => {
      let board = createEmptyStandardBoard();
      board = addUnitToBoard(
        board,
        placed(createTestUnit('black'), 'E-5', 'north'),
      );
      const space = throwIfUndefined(
        board.board['D-5'],
        'expected board space at D-5',
      );
      space.unitPresence = {
        presenceType: 'invalid',
      } as unknown as typeof space.unitPresence; // Intentionally bad type cast to test error path
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 0, 'advance'),
      ).toBe(false);
    });
  });
});
