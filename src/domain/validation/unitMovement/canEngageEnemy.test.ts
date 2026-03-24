import type { StandardBoardCoordinate } from '@entities';
import { createGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { canEngageEnemy } from './canEngageEnemy';

/**
 * canEngageEnemy: Incremental function to check whether engagement is legal from an adjacent space.
 */
describe('canEngageEnemy', () => {
  describe('invalid destination', () => {
    it('given destination has no unit, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 'north', 0),
      ).toBe(false);
    });

    it('given destination has friendly unit, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'D-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 'north', 0),
      ).toBe(false);
    });
  });

  describe('front engagement', () => {
    it('given unit is already facing opposite to enemy, returns true', () => {
      // Enemy at D-5 facing north, unit at E-5 facing south (opposite)
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'south', speed: 2 },
        { coord: 'D-5', player: 'white', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 'south', 0),
      ).toBe(true);
    });

    it('given unit has flexibility to rotate to face opposite, returns true', () => {
      // Enemy at D-4 facing south, unit at E-5 facing northWest (needs to rotate to south)
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'northWest' },
        { coord: 'D-4', player: 'white', facing: 'south' },
      ]);
      const board = gameState.boardState;
      expect(
        canEngageEnemy('black', board, 'D-4', 'E-5', 'E-5', 'east', 1),
      ).toBe(true);
    });

    it('given unit cannot rotate to face opposite, returns false', () => {
      // Enemy at D-4 facing south, unit at E-5 facing northWest (needs to rotate to south)
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'northWest' },
        { coord: 'D-4', player: 'white', facing: 'south' },
      ]);
      const board = gameState.boardState;
      expect(
        canEngageEnemy('black', board, 'D-4', 'E-5', 'E-5', 'east', 0),
      ).toBe(false);
    });
  });

  describe('flank engagement', () => {
    it('given approaching from flank, returns true', () => {
      // Enemy at D-5 facing west, unit at E-5 facing north (flank - south side)
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'D-5', player: 'white', facing: 'west' },
      ]);
      const board = gameState.boardState;
      expect(
        canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 'south', 0),
      ).toBe(true);
    });
  });

  describe('rear engagement', () => {
    it('given approaching from rear and move started behind enemy, returns true', () => {
      // Enemy at D-5 facing north, unit starts at F-5 (behind), moves to E-5, then to D-5
      // E-5 is a rear space (back space) relative to D-5 facing north
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'D-5', player: 'white', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      // Move started at F-5 (behind enemy), adjacent is E-5 (rear space), destination is D-5
      expect(
        canEngageEnemy('black', board, 'D-5', 'E-5', 'F-5', 'north', 0),
      ).toBe(true);
    });

    it('given approaching from rear but move started in front of enemy, returns false', () => {
      // Enemy at D-5 facing north, unit starts at C-5 (in front), moves around to E-5, then to D-5
      // Even though E-5 is a rear space, the move didn't start behind the enemy
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'D-5', player: 'white', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      // Move started at C-5 (in front of enemy), adjacent is E-5 (rear space), destination is D-5
      expect(
        canEngageEnemy('black', board, 'D-5', 'E-5', 'C-6', 'north', 0),
      ).toBe(false);
    });

    it('given approaching from rear but move started at flank, returns false', () => {
      // Enemy at D-5 facing north, unit starts at D-4 (flank), moves to E-5, then to D-5
      // Even though E-5 is a rear space, the move didn't start behind the enemy
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'D-5', player: 'white', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      // Move started at D-4 (flank of enemy), adjacent is E-5 (rear space), destination is D-5
      expect(
        canEngageEnemy('black', board, 'D-5', 'E-5', 'D-4', 'north', 0),
      ).toBe(false);
    });
  });

  describe('error handling', () => {
    it('given a non-existent coordinate, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;
      expect(
        canEngageEnemy(
          'black',
          board,
          invalidCoordinate,
          'E-5',
          'E-5',
          'north',
          0,
        ),
      ).toBe(false);
    });
    it('given a non-adjacent coordinate, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'A-1', player: 'white', facing: 'north', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(
        canEngageEnemy('black', board, 'A-1', 'E-5', 'E-5', 'north', 0),
      ).toBe(false);
    });
  });
});
