import type { StandardBoardCoordinate } from '@entities';
import { MIN_FLEXIBILITY_THRESHOLD } from '@ruleValues';
import { createGameState, createTestUnit } from '@testing';
import { addUnitToBoard, createEmptyStandardBoard } from '@transforms';

import { canMoveThrough } from './canMoveThrough';

/**
 * CanMoveThrough: Determines whether a unit can move through (pass over) a specific coordinate.
 */
describe(canMoveThrough, () => {
  describe('empty space', () => {
    it('given the space has no unit, returns true', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBeTruthy();
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
      // Add unit attempting to move through
      board = addUnitToBoard(board, {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
        unit: createTestUnit('black'),
      });
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      gameState.boardState = board;
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBeFalsy();
    });
  });

  describe('enemy units', () => {
    it('given the space has an enemy unit, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBeFalsy();
    });
  });

  describe('friendly units', () => {
    it('given combined flexibility meets threshold, returns true', () => {
      const halfFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2);
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: halfFlexibility,
          player: 'black',
        },
        {
          coord: 'D-5',
          facing: 'north',
          flexibility: halfFlexibility,
          player: 'black',
        },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBeTruthy();
    });

    it('given combined flexibility exceeds threshold, returns true', () => {
      const overHalfFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2) + 1;
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: overHalfFlexibility,
          player: 'black',
        },
        {
          coord: 'D-5',
          facing: 'north',
          flexibility: overHalfFlexibility,
          player: 'black',
        },
      ]);
      expect(canMoveThrough('black', 3, 'D-5', gameState)).toBeTruthy();
    });

    it('given combined flexibility is below threshold, returns false', () => {
      const underHalfFlexibility =
        Math.floor(MIN_FLEXIBILITY_THRESHOLD / 2) - 1;
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: underHalfFlexibility,
          player: 'black',
        },
        {
          coord: 'D-5',
          facing: 'north',
          flexibility: underHalfFlexibility,
          player: 'black',
        },
      ]);
      expect(canMoveThrough('black', 1, 'D-5', gameState)).toBeFalsy();
    });
  });

  describe('error handling', () => {
    it('given a non-existent coordinate, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;
      expect(
        canMoveThrough('black', 2, invalidCoordinate, gameState),
      ).toBeFalsy();
    });
  });
});
