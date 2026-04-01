import type { StandardBoardCoordinate } from '@entities';
import { MIN_FLEXIBILITY_THRESHOLD } from '@ruleValues';
import { createGameState, createTestUnit } from '@testing';
import { addUnitToBoard, createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { canMoveThrough } from './canMoveThrough';

/**
 * canMoveThrough: Determines whether a unit can move through (pass over) a specific coordinate.
 */
describe('canMoveThrough', () => {
  describe('empty space', () => {
    it('given the space has no unit, returns true', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(true);
    });
  });

  describe('engaged units', () => {
    it('given the space has engaged units, returns false', () => {
      let board = createEmptyStandardBoard();
      // Add engaged units at D-5
      board = addUnitToBoard(board, {
        boardType: 'standard' as const,
        unit: createTestUnit('black'),
        placement: {
          boardType: 'standard' as const,
          coordinate: 'D-5',
          facing: 'north',
        },
      });
      board = addUnitToBoard(board, {
        boardType: 'standard' as const,
        unit: createTestUnit('white'),
        placement: {
          boardType: 'standard' as const,
          coordinate: 'D-5',
          facing: 'south',
        },
      });
      // Add unit attempting to move through
      board = addUnitToBoard(board, {
        boardType: 'standard' as const,
        unit: createTestUnit('black'),
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
      });
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
      ]);
      gameState.boardState = board;
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(false);
    });
  });

  describe('enemy units', () => {
    it('given the space has an enemy unit, returns false', () => {
      const gameState = createGameState([
        { coord: 'E-5', player: 'black', facing: 'north', speed: 2 },
        { coord: 'D-5', player: 'white', facing: 'north', speed: 2 },
      ]);
      expect(canMoveThrough('black', 2, 'D-5', gameState)).toBe(false);
    });
  });

  describe('friendly units', () => {
    it('given combined flexibility meets threshold, returns true', () => {
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

    it('given combined flexibility exceeds threshold, returns true', () => {
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

    it('given combined flexibility is below threshold, returns false', () => {
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
    it('given a non-existent coordinate, returns false', () => {
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
