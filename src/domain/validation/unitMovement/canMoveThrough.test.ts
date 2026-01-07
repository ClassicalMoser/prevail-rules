import type { StandardBoardCoordinate } from '@entities';
import { MIN_FLEXIBILITY_THRESHOLD } from '@ruleValues';
import { createGameState, createTestUnit } from '@testing';
import { addUnitToBoard, createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { canMoveThrough } from './canMoveThrough';

describe('canMoveThrough', () => {
  describe('empty space', () => {
    it('should return true when the space has no unit', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(true);
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
      // Add unit attempting to move through
      board = addUnitToBoard(board, {
        unit: createTestUnit('black'),
        placement: { coordinate: 'E-5', facing: 'north' },
      });
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      gameState.boardState = board;
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(false);
    });
  });

  describe('enemy units', () => {
    it('should return false when the space has an enemy unit', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'D-5', player: 'white', facing: 'north', speed: 2 },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(false);
    });
  });

  describe('friendly units', () => {
    it('should return true when combined flexibility meets threshold', () => {
      const halfFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2);
      const gameState = createGameState([
        {
          coord: 'E-5',
          player: 'black',
          facing: 'north',
          flexibility: halfFlexibility,
        },
        {
          coord: 'D-5',
          player: 'black',
          facing: 'north',
          flexibility: halfFlexibility,
        },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(true);
    });

    it('should return true when combined flexibility exceeds threshold', () => {
      const overHalfFlexibility = Math.ceil(MIN_FLEXIBILITY_THRESHOLD / 2) + 1;
      const gameState = createGameState([
        {
          coord: 'E-5',
          player: 'black',
          facing: 'north',
          flexibility: overHalfFlexibility,
        },
        {
          coord: 'D-5',
          player: 'black',
          facing: 'north',
          flexibility: overHalfFlexibility,
        },
      ]);
      expect(canMoveThrough('black', 3, 'D-5', gameState)).toBe(true);
    });

    it('should return false when combined flexibility is below threshold', () => {
      const underHalfFlexibility =
        Math.floor(MIN_FLEXIBILITY_THRESHOLD / 2) - 1;
      const gameState = createGameState([
        {
          coord: 'E-5',
          player: 'black',
          facing: 'north',
          flexibility: underHalfFlexibility,
        },
        {
          coord: 'D-5',
          player: 'black',
          facing: 'north',
          flexibility: underHalfFlexibility,
        },
      ]);
      expect(canMoveThrough('black', 1, 'D-5', gameState)).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should return false for a non-existent coordinate', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      const invalidCoordinate = 'Z-99' as StandardBoardCoordinate;
      expect(canMoveThrough('black', 2, invalidCoordinate, gameState)).toBe(
        false,
      );
    });
  });
});
