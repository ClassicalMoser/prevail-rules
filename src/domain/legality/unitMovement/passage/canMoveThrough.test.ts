import type { Coordinate } from '@entities';
import { createGameState } from '@testing';

import { canMoveThrough } from './canMoveThrough';

/**
 * CanMoveThrough: Determines whether a unit can move through (pass over) a specific coordinate.
 */
describe('canMoveThrough function', () => {
  describe('empty space', () => {
    it('open ground is crossed freely', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(true);
    });
  });

  describe('engaged units', () => {
    it('an engaged space cannot be crossed', () => {
      // D-5 holds a black unit locked with a white one (§2.2.3, §5.4.4).
      const gameState = createGameState([
        ['E-5', 'black', 'north'],
        ['D-5', 'black', 'north'],
        ['D-5', 'white', 'south'],
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(false);
    });
  });

  describe('enemy units', () => {
    it('an enemy cannot be passed through', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(false);
    });
  });

  describe('friendly units', () => {
    // Two friends pass through each other when their Flexibility adds up to
    // 6 or more (§5.4.2).
    it('a friend may be passed through when the two Flexibilities make 6', () => {
      // 3 and 3 make 6: the mover filters through.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', flexibility: 3, player: 'black' },
        { coord: 'D-5', facing: 'north', flexibility: 3, player: 'black' },
      ]);
      expect(canMoveThrough('black', 3, 'D-5', gameState)).toBe(true);
    });

    it('a friend may not be passed through when the two Flexibilities make 5', () => {
      // 3 and 2: one short.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', flexibility: 3, player: 'black' },
        { coord: 'D-5', facing: 'north', flexibility: 2, player: 'black' },
      ]);
      expect(canMoveThrough('black', 3, 'D-5', gameState)).toBe(false);
    });
  });

  describe('error handling', () => {
    it('throws, naming the coordinate, when it is not on the board', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const invalidCoordinate = 'Z-99' as Coordinate;
      // The caller names a space it has already found, so an absent one is a
      // fault in the caller, not a space a unit cannot pass.
      expect(() =>
        canMoveThrough('black', 2, invalidCoordinate, gameState),
      ).toThrow('Coordinate Z-99 does not exist on standard board.');
    });
  });
});
