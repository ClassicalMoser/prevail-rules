import type { Coordinate } from '@entities';
import { createGameState } from '@testing';

import { canEngageEnemy } from './canEngageEnemy';

/**
 * CanEngageEnemy: Incremental function to check whether engagement is legal from an adjacent space.
 */
describe('canEngageEnemy function', () => {
  describe('invalid destination', () => {
    it('open ground holds no one to engage', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 0)).toBe(
        false,
      );
    });

    it('a friend is never engaged', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 0)).toBe(
        false,
      );
    });

    it('an enemy already engaged cannot be engaged again', () => {
      // D-5 holds a white unit locked with a black one: nothing may enter
      // until that fight is settled, so there is one attacker per defender
      // (§2.2.3, §6.3 edge case).
      const gameState = createGameState([
        ['E-5', 'black', 'north'],
        ['D-5', 'white', 'south'],
        ['D-5', 'black', 'north'],
      ]);
      const board = gameState.boardState;
      expect(canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 0)).toBe(
        false,
      );
    });
  });

  describe('front engagement', () => {
    it('a head-on approach closes with no Flexibility to spare', () => {
      // Enemy at D-5 facing south; stepping north from E-5, its centre front
      // space, the unit already faces it head-on (§6.2.3).
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 0)).toBe(true);
    });

    it('a corner front approach closes with a point left to square up', () => {
      // Enemy at D-4 facing south; stepping northWest from E-5, a corner
      // front space, the unit must turn to face north, head-on (§6.2.3).
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northWest', player: 'black' },
        { coord: 'D-4', facing: 'south', player: 'white' },
      ]);
      const board = gameState.boardState;
      expect(canEngageEnemy('black', board, 'D-4', 'E-5', 'E-5', 1)).toBe(true);
    });

    it('a corner front approach cannot close with no point left to square up', () => {
      // The same approach, with no Flexibility left for the squaring turn.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northWest', player: 'black' },
        { coord: 'D-4', facing: 'south', player: 'white' },
      ]);
      const board = gameState.boardState;
      expect(canEngageEnemy('black', board, 'D-4', 'E-5', 'E-5', 0)).toBe(
        false,
      );
    });
  });

  describe('flank engagement', () => {
    it('a flank approach is always allowed, even with no Flexibility left', () => {
      // Enemy at D-5 facing west, unit at E-5 facing north (flank - south side)
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'west', player: 'white' },
      ]);
      const board = gameState.boardState;
      expect(canEngageEnemy('black', board, 'D-5', 'E-5', 'E-5', 0)).toBe(true);
    });
  });

  describe('rear engagement', () => {
    it('a rear approach is allowed when the move began behind the enemy', () => {
      // Enemy at D-5 facing north, unit starts at F-5 (behind), moves to E-5, then to D-5
      // E-5 is a rear space (back space) relative to D-5 facing north
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      const board = gameState.boardState;
      // Move started at F-5 (behind enemy), adjacent is E-5 (rear space), destination is D-5
      expect(canEngageEnemy('black', board, 'D-5', 'E-5', 'F-5', 0)).toBe(true);
    });

    it('a rear approach is refused when the move began in front of the enemy', () => {
      // Enemy at D-5 facing north, unit starts at C-5 (in front), moves around to E-5, then to D-5
      // Even though E-5 is a rear space, the move didn't start behind the enemy
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      const board = gameState.boardState;
      // Move started at C-5 (in front of enemy), adjacent is E-5 (rear space), destination is D-5
      expect(canEngageEnemy('black', board, 'D-5', 'E-5', 'C-5', 0)).toBe(
        false,
      );
    });

    it('a rear approach is refused when the move began on the enemy flank', () => {
      // Enemy at D-5 facing north, unit starts at D-4 (flank), moves to E-5, then to D-5
      // Even though E-5 is a rear space, the move didn't start behind the enemy
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      const board = gameState.boardState;
      // Move started at D-4 (flank of enemy), adjacent is E-5 (rear space), destination is D-5
      expect(canEngageEnemy('black', board, 'D-5', 'E-5', 'D-4', 0)).toBe(
        false,
      );
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
      // fault in the caller, not an engagement that is not legal.
      expect(() =>
        canEngageEnemy('black', board, invalidCoordinate, 'E-5', 'E-5', 0),
      ).toThrow('Coordinate Z-99 does not exist on standard board.');
    });

    it('a step from a space that is not next to the enemy engages no one', () => {
      // E-5 is nowhere near A-1, so no single step joins them.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'A-1', facing: 'north', player: 'white', speed: 2 },
      ]);
      const board = gameState.boardState;
      expect(canEngageEnemy('black', board, 'A-1', 'E-5', 'E-5', 0)).toBe(
        false,
      );
    });
  });
});
