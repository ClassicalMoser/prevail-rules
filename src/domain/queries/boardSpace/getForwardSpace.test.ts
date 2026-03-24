import type {
  SmallBoard,
  SmallBoardCoordinate,
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
} from '@entities';
import { createEmptySmallBoard, createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getForwardSpace } from './getForwardSpace';

const standardBoard: StandardBoard = createEmptyStandardBoard();
const smallBoard: SmallBoard = createEmptySmallBoard();

/**
 * getForwardSpace: one step forward from a coordinate along the facing; respects standard vs small board bounds;
 * throws on malformed coordinate or invalid facing.
 */
describe('getForwardSpace', () => {
  describe('standard board', () => {
    it('given facing south from A-1, returns B-1', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'south')).toBe('B-1');
    });
    it('given facing east from A-1, returns A-2', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'east')).toBe('A-2');
    });
    it('given facing west from E-5, returns E-4', () => {
      expect(getForwardSpace(standardBoard, 'E-5', 'west')).toBe('E-4');
    });
    it('given facing north from G-10, returns F-10', () => {
      expect(getForwardSpace(standardBoard, 'G-10', 'north')).toBe('F-10');
    });

    it('given facing southEast from A-1, returns B-2', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'southEast')).toBe('B-2');
    });
    it('given facing southWest from D-4, returns E-3', () => {
      expect(getForwardSpace(standardBoard, 'D-4', 'southWest')).toBe('E-3');
    });
    it('given facing northEast from K-11, returns J-12', () => {
      expect(getForwardSpace(standardBoard, 'K-11', 'northEast')).toBe('J-12');
    });
    it('given facing northWest from L-18, returns K-17', () => {
      expect(getForwardSpace(standardBoard, 'L-18', 'northWest')).toBe('K-17');
    });

    it('given facing north from A-1, returns undefined', () => {
      expect(getForwardSpace(standardBoard, 'A-1', 'north')).toBeUndefined();
    });
    it('given facing west from F-1, returns undefined', () => {
      expect(getForwardSpace(standardBoard, 'F-1', 'west')).toBeUndefined();
    });
    it('given facing south from L-5, returns undefined', () => {
      expect(getForwardSpace(standardBoard, 'L-5', 'south')).toBeUndefined();
    });
    it('given facing east from E-18, returns undefined', () => {
      expect(getForwardSpace(standardBoard, 'E-18', 'east')).toBeUndefined();
    });

    it('given facing northWest from A-1, returns undefined', () => {
      expect(
        getForwardSpace(standardBoard, 'A-1', 'northWest'),
      ).toBeUndefined();
    });
    it('given facing northEast from A-18, returns undefined', () => {
      expect(
        getForwardSpace(standardBoard, 'A-18', 'northEast'),
      ).toBeUndefined();
    });
    it('given facing southWest from L-1, returns undefined', () => {
      expect(
        getForwardSpace(standardBoard, 'L-1', 'southWest'),
      ).toBeUndefined();
    });
    it('given facing southEast from L-18, returns undefined', () => {
      expect(
        getForwardSpace(standardBoard, 'L-18', 'southEast'),
      ).toBeUndefined();
    });
    it('given facing northWest from F-1, returns undefined', () => {
      expect(
        getForwardSpace(standardBoard, 'F-1', 'northWest'),
      ).toBeUndefined();
    });
    it('given facing northEast from E-18, returns undefined', () => {
      expect(
        getForwardSpace(standardBoard, 'E-18', 'northEast'),
      ).toBeUndefined();
    });
    it('given facing southWest from L-5, returns undefined', () => {
      expect(
        getForwardSpace(standardBoard, 'L-5', 'southWest'),
      ).toBeUndefined();
    });
    it('given facing northWest from E-1, returns undefined', () => {
      expect(
        getForwardSpace(standardBoard, 'E-1', 'northWest'),
      ).toBeUndefined();
    });

    it('given coordinate missing dash, throws', () => {
      expect(() =>
        getForwardSpace(
          standardBoard,
          'invalid' as StandardBoardCoordinate,
          'north',
        ),
      ).toThrow(new Error('Invalid coordinate: invalid'));
    });

    it('given invalid row letter, throws', () => {
      expect(() =>
        getForwardSpace(
          standardBoard,
          'R-12' as StandardBoardCoordinate,
          'north',
        ),
      ).toThrow(new Error('Invalid row: R'));
    });

    it('given invalid column, throws', () => {
      expect(() =>
        getForwardSpace(
          standardBoard,
          'A-19' as StandardBoardCoordinate,
          'north',
        ),
      ).toThrow(new Error('Invalid column: 19'));
    });

    it('given invalid facing, throws', () => {
      expect(() =>
        getForwardSpace(standardBoard, 'E-9', 'random' as UnitFacing),
      ).toThrow(new Error('Invalid facing: random'));
    });
  });
  describe('small board', () => {
    it('given facing south from A-1, returns B-1', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'south')).toBe('B-1');
    });
    it('given facing east from A-1, returns A-2', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'east')).toBe('A-2');
    });
    it('given facing west from E-5, returns E-4', () => {
      expect(getForwardSpace(smallBoard, 'E-5', 'west')).toBe('E-4');
    });
    it('given facing north from G-10, returns F-10', () => {
      expect(getForwardSpace(smallBoard, 'G-10', 'north')).toBe('F-10');
    });

    it('given facing southEast from A-1, returns B-2', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'southEast')).toBe('B-2');
    });
    it('given facing southWest from D-4, returns E-3', () => {
      expect(getForwardSpace(smallBoard, 'D-4', 'southWest')).toBe('E-3');
    });
    it('given facing northEast from H-11, returns G-12', () => {
      expect(getForwardSpace(smallBoard, 'H-11', 'northEast')).toBe('G-12');
    });
    it('given facing northWest from H-12, returns G-11', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'northWest')).toBe('G-11');
    });

    // Edge cases at H (last row in small board, vs L in standard)
    it('given facing south from H-5 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'H-5', 'south')).toBeUndefined();
    });
    it('given facing southEast from H-10 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'H-10', 'southEast')).toBeUndefined();
    });
    it('given facing southWest from H-3 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'H-3', 'southWest')).toBeUndefined();
    });

    // Edge cases at column 12 (last column in small board, vs 18 in standard)
    it('given facing east from E-12 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'E-12', 'east')).toBeUndefined();
    });
    it('given facing northEast from A-12 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'A-12', 'northEast')).toBeUndefined();
    });
    it('given facing southEast from D-12 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'D-12', 'southEast')).toBeUndefined();
    });

    // Corner cases at H-12 (bottom-right corner in small board, vs L-18 in standard)
    it('given facing south from H-12 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'south')).toBeUndefined();
    });
    it('given facing east from H-12 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'east')).toBeUndefined();
    });
    it('given facing southEast from H-12 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'H-12', 'southEast')).toBeUndefined();
    });

    // Standard boundary cases that also apply to small board
    it('given facing north from A-1 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'north')).toBeUndefined();
    });
    it('given facing west from F-1 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'F-1', 'west')).toBeUndefined();
    });
    it('given facing northWest from A-1 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'A-1', 'northWest')).toBeUndefined();
    });
    it('given facing southWest from H-1 on small board, returns undefined', () => {
      expect(getForwardSpace(smallBoard, 'H-1', 'southWest')).toBeUndefined();
    });

    // Validation tests - malformed coordinates
    it('given coordinate missing dash, throws', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'E5' as SmallBoardCoordinate, 'north'),
      ).toThrow(new Error('Invalid coordinate: E5'));
    });

    // Validation tests - rows I, J, K, L don't exist in small board
    it('given row I on small board, throws', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'I-5' as SmallBoardCoordinate, 'north'),
      ).toThrow(new Error('Invalid row: I'));
    });
    it('given row L on small board, throws', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'L-5' as SmallBoardCoordinate, 'north'),
      ).toThrow(new Error('Invalid row: L'));
    });

    // Validation tests - columns 13-18 don't exist in small board
    it('given column 13 on small board, throws', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'A-13' as SmallBoardCoordinate, 'north'),
      ).toThrow(new Error('Invalid column: 13'));
    });
    it('given column 18 on small board, throws', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'A-18' as SmallBoardCoordinate, 'north'),
      ).toThrow(new Error('Invalid column: 18'));
    });

    it('given invalid facing, throws', () => {
      expect(() =>
        getForwardSpace(smallBoard, 'E-9', 'random' as UnitFacing),
      ).toThrow(new Error('Invalid facing: random'));
    });
  });
});
