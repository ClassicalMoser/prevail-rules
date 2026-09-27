import type { Board, Coordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@factories';

import { getRightSpace } from './getRightSpace';

const standardBoard: Board = createEmptyStandardBoard();

/**
 * GetRightSpace: one step to the unit's right from a coordinate and facing; undefined if off the board; throws on
 * invalid coordinate or facing.
 */
describe(getRightSpace, () => {
  it('returns E-6 when facing north at E-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'north')).toBe('E-6');
  });

  it('returns F-5 when facing east at E-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'east')).toBe('F-5');
  });

  it('returns E-4 when facing south at E-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'south')).toBe('E-4');
  });

  it('returns D-5 when facing west at E-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'west')).toBe('D-5');
  });

  it('returns F-6 when facing northEast at E-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'northEast')).toBe('F-6');
  });

  it('returns F-4 when facing southEast at E-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'southEast')).toBe('F-4');
  });

  it('returns D-4 when facing southWest at E-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'southWest')).toBe('D-4');
  });

  it('returns D-6 when facing northWest at E-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'northWest')).toBe('D-6');
  });

  it('returns undefined when facing north at E-18', () => {
    expect(getRightSpace(standardBoard, 'E-18', 'north')).toBeUndefined();
  });

  it('returns undefined when facing east at L-5', () => {
    expect(getRightSpace(standardBoard, 'L-5', 'east')).toBeUndefined();
  });

  it('returns undefined when facing south at E-1', () => {
    expect(getRightSpace(standardBoard, 'E-1', 'south')).toBeUndefined();
  });

  it('returns undefined when facing west at A-5', () => {
    expect(getRightSpace(standardBoard, 'A-5', 'west')).toBeUndefined();
  });

  it('returns undefined when facing northEast at L-18', () => {
    expect(getRightSpace(standardBoard, 'L-18', 'northEast')).toBeUndefined();
  });

  it('returns undefined when facing southEast at L-1', () => {
    expect(getRightSpace(standardBoard, 'L-1', 'southEast')).toBeUndefined();
  });

  it('returns undefined when facing southWest at A-1', () => {
    expect(getRightSpace(standardBoard, 'A-1', 'southWest')).toBeUndefined();
  });

  it('returns undefined when facing northWest at A-18', () => {
    expect(getRightSpace(standardBoard, 'A-18', 'northWest')).toBeUndefined();
  });

  it('throws when the row letter is invalid', () => {
    expect(() =>
      getRightSpace(standardBoard, 'R-12' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('throws when the column is invalid', () => {
    expect(() =>
      getRightSpace(standardBoard, 'A-19' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('throws when the facing is invalid', () => {
    expect(() =>
      getRightSpace(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
