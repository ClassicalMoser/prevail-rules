import type { StandardBoardCoordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@transforms';

import { getFlankingSpaces } from './getFlankingSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetFlankingSpaces: the two spaces orthogonal to the facing axis (left and right of forward), clipped to board.
 */
describe(getFlankingSpaces, () => {
  it('given cardinal facings at E-5, returns two flanking spaces each', () => {
    expect(getFlankingSpaces(standardBoard, 'E-5', 'north')).toStrictEqual(
      new Set(['E-4', 'E-6']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'east')).toStrictEqual(
      new Set(['D-5', 'F-5']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'south')).toStrictEqual(
      new Set(['E-6', 'E-4']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'west')).toStrictEqual(
      new Set(['F-5', 'D-5']),
    );
  });

  it('given diagonal facings at E-5, returns two flanking spaces each', () => {
    expect(getFlankingSpaces(standardBoard, 'E-5', 'northEast')).toStrictEqual(
      new Set(['D-4', 'F-6']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'southEast')).toStrictEqual(
      new Set(['D-6', 'F-4']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'southWest')).toStrictEqual(
      new Set(['F-6', 'D-4']),
    );
    expect(getFlankingSpaces(standardBoard, 'E-5', 'northWest')).toStrictEqual(
      new Set(['F-4', 'D-6']),
    );
  });

  it('given corners, clips to in-bounds flank only', () => {
    expect(getFlankingSpaces(standardBoard, 'A-1', 'north')).toStrictEqual(
      new Set(['A-2']),
    );
    expect(getFlankingSpaces(standardBoard, 'A-1', 'east')).toStrictEqual(
      new Set(['B-1']),
    );
    expect(getFlankingSpaces(standardBoard, 'L-18', 'south')).toStrictEqual(
      new Set(['L-17']),
    );
    expect(getFlankingSpaces(standardBoard, 'L-18', 'west')).toStrictEqual(
      new Set(['K-18']),
    );
  });

  it('given both flanks off board, returns empty set', () => {
    expect(getFlankingSpaces(standardBoard, 'A-1', 'northWest').size).toBe(0);
    expect(getFlankingSpaces(standardBoard, 'L-1', 'southWest').size).toBe(0);
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
