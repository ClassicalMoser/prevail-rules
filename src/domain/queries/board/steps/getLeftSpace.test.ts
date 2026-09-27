import type { Board, Coordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@factories';

import { getLeftSpace } from './getLeftSpace';

const standardBoard: Board = createEmptyStandardBoard();

/**
 * GetLeftSpace: one step to the unit's left from a coordinate and facing; undefined if off the board; throws on
 * invalid coordinate or facing.
 */
describe(getLeftSpace, () => {
  it('returns E-4 when facing north at E-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'north')).toBe('E-4');
  });

  it('returns D-5 when facing east at E-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'east')).toBe('D-5');
  });

  it('returns E-6 when facing south at E-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'south')).toBe('E-6');
  });

  it('returns F-5 when facing west at E-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'west')).toBe('F-5');
  });

  it('returns D-4 when facing northEast at E-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'northEast')).toBe('D-4');
  });

  it('returns D-6 when facing southEast at E-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'southEast')).toBe('D-6');
  });

  it('returns F-6 when facing southWest at E-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'southWest')).toBe('F-6');
  });

  it('returns F-4 when facing northWest at E-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'northWest')).toBe('F-4');
  });

  it('returns undefined when facing north at E-1', () => {
    expect(getLeftSpace(standardBoard, 'E-1', 'north')).toBeUndefined();
  });

  it('returns undefined when facing east at A-5', () => {
    expect(getLeftSpace(standardBoard, 'A-5', 'east')).toBeUndefined();
  });

  it('returns undefined when facing south at E-18', () => {
    expect(getLeftSpace(standardBoard, 'E-18', 'south')).toBeUndefined();
  });

  it('returns undefined when facing west at L-5', () => {
    expect(getLeftSpace(standardBoard, 'L-5', 'west')).toBeUndefined();
  });

  it('returns undefined when facing northEast at A-1', () => {
    expect(getLeftSpace(standardBoard, 'A-1', 'northEast')).toBeUndefined();
  });

  it('returns undefined when facing southEast at A-18', () => {
    expect(getLeftSpace(standardBoard, 'A-18', 'southEast')).toBeUndefined();
  });

  it('returns undefined when facing southWest at L-1', () => {
    expect(getLeftSpace(standardBoard, 'L-1', 'southWest')).toBeUndefined();
  });

  it('returns undefined when facing northWest at L-18', () => {
    expect(getLeftSpace(standardBoard, 'L-18', 'northWest')).toBeUndefined();
  });

  it('throws when the row letter is invalid', () => {
    expect(() =>
      getLeftSpace(standardBoard, 'R-12' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('throws when the column is invalid', () => {
    expect(() =>
      getLeftSpace(standardBoard, 'A-19' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('throws when the facing is invalid', () => {
    expect(() =>
      getLeftSpace(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
