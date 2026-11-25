import type { Coordinate } from '@entities';
import { createGameState } from '@testing';

import { canMoveInto } from './canMoveInto';

/**
 * CanMoveInto: Determines whether a unit can move into (end its movement at) a specific coordinate.
 */
describe('canMoveInto function', () => {
  describe('empty space', () => {
    it('a move may end on open ground', () => {
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
    it('a move may not end in an engaged space', () => {
      // D-5 holds a black unit locked with a white one; the black unit on
      // E-5 may not join them (§2.2.3).
      const gameState = createGameState([
        ['E-5', 'black', 'north'],
        ['D-5', 'black', 'north'],
        ['D-5', 'white', 'south'],
      ]);
      const board = gameState.boardState;
      expect(
        canMoveInto('black', board, 'D-5', 'E-5', 'E-5', 0, 'advance'),
      ).toBe(false);
    });
  });

  describe('friendly units', () => {
    it('a move may not end on a friend', () => {
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
      it('an advance may end on an enemy it can legally engage', () => {
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

      it('an advance may not end on an enemy it cannot legally engage', () => {
        // E-5 is the north-facing enemy's back space, and a move begun on
        // its flank (D-4) may not take it from behind (§6.2.2).
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
      it('a retreat may not end on an enemy, even one an advance could engage', () => {
        // The black unit faces south and falls back north into D-5, where a
        // white unit stands facing it: from E-5, its centre front space, an
        // advance could close head-on. A retreat never creates an engagement
        // (§9.1.7).
        const gameState = createGameState([
          { coord: 'E-5', facing: 'south', player: 'black', speed: 2 },
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
  });
});
