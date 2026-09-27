import type { Coordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@factories';

import { getFrontSpaces } from './getFrontSpaces';

const standardBoard = createEmptyStandardBoard();

/**
 * GetFrontSpaces: the three spaces in the unit's front arc (two flanking diagonals + forward), clipped to the board.
 */
describe(getFrontSpaces, () => {
  it('returns three-space front arc each when cardinal facings at E-5', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'north')).toStrictEqual(
      new Set(['D-4', 'D-6', 'D-5']),
    );
    expect(getFrontSpaces(standardBoard, 'E-5', 'east')).toStrictEqual(
      new Set(['D-6', 'F-6', 'E-6']),
    );
    expect(getFrontSpaces(standardBoard, 'E-5', 'south')).toStrictEqual(
      new Set(['F-6', 'F-4', 'F-5']),
    );
    expect(getFrontSpaces(standardBoard, 'E-5', 'west')).toStrictEqual(
      new Set(['F-4', 'D-4', 'E-4']),
    );
  });

  it('returns three-space front arc each when diagonal facings at E-5', () => {
    expect(getFrontSpaces(standardBoard, 'E-5', 'northEast')).toStrictEqual(
      new Set(['D-5', 'E-6', 'D-6']),
    );
    expect(getFrontSpaces(standardBoard, 'E-5', 'southEast')).toStrictEqual(
      new Set(['E-6', 'F-5', 'F-6']),
    );
    expect(getFrontSpaces(standardBoard, 'E-5', 'southWest')).toStrictEqual(
      new Set(['F-5', 'E-4', 'F-4']),
    );
    expect(getFrontSpaces(standardBoard, 'E-5', 'northWest')).toStrictEqual(
      new Set(['E-4', 'D-5', 'D-4']),
    );
  });

  it('clips the front arc to in-bounds spaces at a corner', () => {
    expect(getFrontSpaces(standardBoard, 'A-1', 'south')).toStrictEqual(
      new Set(['B-2', 'B-1']),
    );
    expect(getFrontSpaces(standardBoard, 'A-1', 'east')).toStrictEqual(
      new Set(['B-2', 'A-2']),
    );
    expect(getFrontSpaces(standardBoard, 'L-18', 'north')).toStrictEqual(
      new Set(['K-17', 'K-18']),
    );
    expect(getFrontSpaces(standardBoard, 'L-18', 'west')).toStrictEqual(
      new Set(['K-17', 'L-17']),
    );
  });

  it('returns an empty set when the whole front arc is off the board', () => {
    expect(getFrontSpaces(standardBoard, 'A-5', 'north').size).toBe(0);
    expect(getFrontSpaces(standardBoard, 'E-18', 'east').size).toBe(0);
  });

  it('throws when the row letter is invalid', () => {
    expect(() =>
      getFrontSpaces(standardBoard, 'R-12' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('throws when the column is invalid', () => {
    expect(() =>
      getFrontSpaces(standardBoard, 'A-19' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('throws when the facing is invalid', () => {
    expect(() =>
      getFrontSpaces(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
