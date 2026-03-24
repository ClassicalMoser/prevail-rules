import type { StandardBoardCoordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getFlankingSpaces } from './getFlankingSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * getFlankingSpaces: the two spaces orthogonal to the facing axis (left and right of forward), clipped to board.
 */
describe('getFlankingSpaces', () => {
  it('given cardinal facings at E-5, returns two flanking spaces each', () => {
    expect(getFlankingSpaces(standardBoard, 'E-5', 'north')).toEqual(
      new Set(['E-4', 'E-6']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'east')).toEqual(
      new Set(['D-5', 'F-5']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'south')).toEqual(
      new Set(['E-6', 'E-4']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'west')).toEqual(
      new Set(['F-5', 'D-5']),
    );
  });

  it('given diagonal facings at E-5, returns two flanking spaces each', () => {
    expect(getFlankingSpaces(standardBoard, 'E-5', 'northEast')).toEqual(
      new Set(['D-4', 'F-6']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'southEast')).toEqual(
      new Set(['D-6', 'F-4']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'southWest')).toEqual(
      new Set(['F-6', 'D-4']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'northWest')).toEqual(
      new Set(['F-4', 'D-6']),
    );
  });

  it('given corners, clips to in-bounds flank only', () => {
    expect(getFlankingSpaces(standardBoard, 'A-1', 'north')).toEqual(
      new Set(['A-2']),
    );
    expect(getFlankingSpaces(standardBoard, 'A-1', 'east')).toEqual(
      new Set(['B-1']),
    );
    expect(getFlankingSpaces(standardBoard, 'L-18', 'south')).toEqual(
      new Set(['L-17']),
    );
    expect(getFlankingSpaces(standardBoard, 'L-18', 'west')).toEqual(
      new Set(['K-18']),
    );
  });

  it('given both flanks off board, returns empty set', () => {
    expect(getFlankingSpaces(standardBoard, 'A-1', 'northWest')).toEqual(
      new Set([]),
    );
    expect(getFlankingSpaces(standardBoard, 'L-1', 'southWest')).toEqual(
      new Set([]),
    );
  });

  it('given invalid row letter, throws', () => {
    expect(() =>
      getFlankingSpaces(
        standardBoard,
        'R-12' as StandardBoardCoordinate,
        'north',
      ),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('given invalid column, throws', () => {
    expect(() =>
      getFlankingSpaces(
        standardBoard,
        'A-19' as StandardBoardCoordinate,
        'north',
      ),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('given invalid facing, throws', () => {
    expect(() =>
      getFlankingSpaces(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
