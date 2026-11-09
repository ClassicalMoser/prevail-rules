import { MIN_FLEXIBILITY_THRESHOLD } from '@ruleValues';
import { createGameState, createTestUnit, placed } from '@testing';
import { addUnitToBoard } from '@transforms';
import { createEmptyStandardBoard, createEmptyGameState } from '@factories';

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
  });
  // Every diagonal case steps northEast from E-5 to D-6; the corner spaces
  // flanking that step are D-5 and E-6.
  describe('diagonal facings with no enemy units', () => {
    it('given both adjacent spaces are empty, returns true', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
      ]);
      expect(checkDiagonalMove('black', 0, gameState, 'E-5', 'D-6')).toBe(true);
    });
  });
  describe('diagonal facings with enemy units', () => {
    it('given only one adjacent space is occupied by an enemy, returns true', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      expect(checkDiagonalMove('black', 0, gameState, 'E-5', 'D-6')).toBe(true);
    });

    it('given both adjacent spaces are occupied by enemy units, returns false', () => {
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
    it('given only one adjacent space is occupied by engaged units, returns true', () => {
      // Create game state with engaged units at D-5, and unit under test at E-5
      let board = createEmptyStandardBoard();

      // Add engaged units at D-5 (first unit, then second with opposite facing creates engagement)
      board = addUnitToBoard(
        board,
        placed(createTestUnit('black', { speed: 2 }), 'D-5', 'north'),
      );
      board = addUnitToBoard(
        board,
        placed(createTestUnit('white', { speed: 2 }), 'D-5', 'south'),
      );

      // Add unit under test at E-5
      board = addUnitToBoard(
        board,
        placed(
          createTestUnit('black', { instanceNumber: 3, speed: 2 }),
          'E-5',
          'northEast',
        ),
      );

      const gameState = createEmptyGameState('standard');
      gameState.boardState = board;
      expect(checkDiagonalMove('black', 0, gameState, 'E-5', 'D-6')).toBe(true);
    });

    it('given both adjacent spaces are occupied by engaged units, returns false', () => {
      // Create game state with engaged units at D-5 and E-6, and unit under test at E-5
      let board = createEmptyStandardBoard();

      // Add engaged units at D-5 (first unit, then second with opposite facing creates engagement)
      board = addUnitToBoard(
        board,
        placed(createTestUnit('black', { speed: 2 }), 'D-5', 'north'),
      );
      board = addUnitToBoard(
        board,
        placed(createTestUnit('white', { speed: 2 }), 'D-5', 'south'),
      );

      // Add engaged units at E-6
      board = addUnitToBoard(
        board,
        placed(
          createTestUnit('black', { instanceNumber: 2, speed: 2 }),
          'E-6',
          'north',
        ),
      );
      board = addUnitToBoard(
        board,
        placed(
          createTestUnit('white', { instanceNumber: 2, speed: 2 }),
          'E-6',
          'south',
        ),
      );

      // Add unit under test at E-5
      board = addUnitToBoard(
        board,
        placed(
          createTestUnit('black', { instanceNumber: 3, speed: 2 }),
          'E-5',
          'northEast',
        ),
      );

      const gameState = createEmptyGameState('standard');
      gameState.boardState = board;
      expect(checkDiagonalMove('black', 0, gameState, 'E-5', 'D-6')).toBe(
        false,
      );
    });
  });
  describe('diagonal facings with friendly units', () => {
    it('given one adjacent space has low flexibility friendly unit, returns true', () => {
      const lowFlexibility = Math.floor(MIN_FLEXIBILITY_THRESHOLD / 2) - 1;
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'northEast',
          flexibility: lowFlexibility,
          player: 'black',
        },
        {
          coord: 'E-6',
          facing: 'north',
          flexibility: lowFlexibility,
          player: 'black',
        },
      ]);
      expect(
        checkDiagonalMove('black', lowFlexibility, gameState, 'E-5', 'D-6'),
      ).toBe(true);
    });

    it('given both adjacent spaces have low flexibility friendly units, returns false', () => {
      const lowFlexibility = Math.floor(MIN_FLEXIBILITY_THRESHOLD / 2) - 1;
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'northEast',
          flexibility: lowFlexibility,
          player: 'black',
        },
        {
          coord: 'D-5',
          facing: 'north',
          flexibility: lowFlexibility,
          player: 'black',
        },
        {
          coord: 'E-6',
          facing: 'north',
          flexibility: lowFlexibility,
          player: 'black',
        },
      ]);
      expect(
        checkDiagonalMove('black', lowFlexibility, gameState, 'E-5', 'D-6'),
      ).toBe(false);
    });

    it('given both adjacent spaces have high flexibility friendly units, returns true', () => {
      const highFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2) + 1;
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'northEast',
          flexibility: highFlexibility,
          player: 'black',
        },
        {
          coord: 'D-5',
          facing: 'north',
          flexibility: highFlexibility,
          player: 'black',
        },
        {
          coord: 'E-6',
          facing: 'north',
          flexibility: highFlexibility,
          player: 'black',
        },
      ]);
      expect(
        checkDiagonalMove('black', highFlexibility, gameState, 'E-5', 'D-6'),
      ).toBe(true);
    });

    it('given one adjacent space has low flexibility friendly unit and the other has high flexibility friendly unit, returns true', () => {
      const lowFlexibility = Math.floor(MIN_FLEXIBILITY_THRESHOLD / 2) - 1;
      const highFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2) + 1;
      const middleFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2);
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'northEast',
          flexibility: middleFlexibility,
          player: 'black',
        },
        {
          coord: 'D-5',
          facing: 'north',
          flexibility: lowFlexibility,
          player: 'black',
        },
        {
          coord: 'E-6',
          facing: 'north',
          flexibility: highFlexibility,
          player: 'black',
        },
      ]);
      expect(
        checkDiagonalMove('black', middleFlexibility, gameState, 'E-5', 'D-6'),
      ).toBe(true);
    });
  });
});
