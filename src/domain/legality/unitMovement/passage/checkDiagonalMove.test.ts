import { createGameState } from '@testing';

import { checkDiagonalMove } from './checkDiagonalMove';

/**
 * CheckDiagonalMove: whether a diagonal step is legal given the two bracketing orthogonals and occupancy.
 */
describe('checkDiagonalMove function', () => {
  describe('non-diagonal steps', () => {
    it('an orthogonal step has no corners to pass between, so asking is a fault', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      expect(() =>
        checkDiagonalMove('black', 0, gameState, 'E-5', 'E-6'),
      ).toThrow('The step is not diagonal');
    });

    it('two spaces that are not neighbours are not a step, so asking is a fault', () => {
      // E-5 and C-7 lie on one diagonal, but two spaces apart.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
      ]);
      expect(() =>
        checkDiagonalMove('black', 0, gameState, 'E-5', 'C-7'),
      ).toThrow('The two spaces are not neighbours');
    });
  });
  // Every diagonal case steps northEast from E-5 to D-6; the corner spaces
  // flanking that step are D-5 and E-6.
  describe('diagonal facings with no enemy units', () => {
    it('a diagonal with both corners open may be stepped across', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
      ]);
      expect(checkDiagonalMove('black', 0, gameState, 'E-5', 'D-6')).toBe(true);
    });
  });
  describe('diagonal facings with enemy units', () => {
    it('one enemy at a corner does not block the diagonal', () => {
      // §2.4.4: it takes enemies in both corners to block it.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      expect(checkDiagonalMove('black', 0, gameState, 'E-5', 'D-6')).toBe(true);
    });

    it('enemies at both corners block the diagonal', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
        { coord: 'E-6', facing: 'north', player: 'white', speed: 2 },
      ]);
      expect(checkDiagonalMove('black', 0, gameState, 'E-5', 'D-6')).toBe(
        false,
      );
    });
  });
  describe('diagonal facings with engaged units', () => {
    it('engaged spaces at both corners shut the diagonal', () => {
      // An engaged space cannot be passed through (§5.4.4), so neither
      // corner lets the mover slip past.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
        ['D-5', 'black', 'north'],
        ['D-5', 'white', 'south'],
        ['E-6', 'black', 'north'],
        ['E-6', 'white', 'south'],
      ]);
      expect(checkDiagonalMove('black', 0, gameState, 'E-5', 'D-6')).toBe(
        false,
      );
    });
  });
  describe('diagonal facings with friendly units', () => {
    // The mover has Flexibility 2. A friend of Flexibility 2 is too stiff
    // to pass (2 + 2 is under 6); one of Flexibility 4 is not (§5.4.2).
    it('friends too stiff to pass at both corners shut the diagonal for the mover', () => {
      // §5.4.5: a wall of stiff friends closes a diagonal to a mover, though
      // not to support or commanders.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', flexibility: 2, player: 'black' },
        { coord: 'D-5', facing: 'north', flexibility: 2, player: 'black' },
        { coord: 'E-6', facing: 'north', flexibility: 2, player: 'black' },
      ]);
      expect(checkDiagonalMove('black', 2, gameState, 'E-5', 'D-6')).toBe(
        false,
      );
    });

    it('one friend loose enough to pass opens the diagonal beside a stiff one', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', flexibility: 2, player: 'black' },
        { coord: 'D-5', facing: 'north', flexibility: 2, player: 'black' },
        { coord: 'E-6', facing: 'north', flexibility: 4, player: 'black' },
      ]);
      expect(checkDiagonalMove('black', 2, gameState, 'E-5', 'D-6')).toBe(true);
    });
  });
});
