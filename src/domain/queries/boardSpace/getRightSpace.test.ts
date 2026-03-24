import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
} from '@entities';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getRightSpace } from './getRightSpace';

const standardBoard: StandardBoard = createEmptyStandardBoard();

/**
 * getRightSpace: one step to the unit's right from a coordinate and facing; undefined if off the board; throws on
 * invalid coordinate or facing.
 */
describe('getRightSpace', () => {
  it('given facing north at E-5, returns E-6', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'north')).toBe('E-6');
  });
  it('given facing east at E-5, returns F-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'east')).toBe('F-5');
  });
  it('given facing south at E-5, returns E-4', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'south')).toBe('E-4');
  });
  it('given facing west at E-5, returns D-5', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'west')).toBe('D-5');
  });

  it('given facing northEast at E-5, returns F-6', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'northEast')).toBe('F-6');
  });
  it('given facing southEast at E-5, returns F-4', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'southEast')).toBe('F-4');
  });
  it('given facing southWest at E-5, returns D-4', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'southWest')).toBe('D-4');
  });
  it('given facing northWest at E-5, returns D-6', () => {
    expect(getRightSpace(standardBoard, 'E-5', 'northWest')).toBe('D-6');
  });

  it('given facing north at E-18, returns undefined', () => {
    expect(getRightSpace(standardBoard, 'E-18', 'north')).toBeUndefined();
  });
  it('given facing east at L-5, returns undefined', () => {
    expect(getRightSpace(standardBoard, 'L-5', 'east')).toBeUndefined();
  });
  it('given facing south at E-1, returns undefined', () => {
    expect(getRightSpace(standardBoard, 'E-1', 'south')).toBeUndefined();
  });
  it('given facing west at A-5, returns undefined', () => {
    expect(getRightSpace(standardBoard, 'A-5', 'west')).toBeUndefined();
  });

  it('given facing northEast at L-18, returns undefined', () => {
    expect(getRightSpace(standardBoard, 'L-18', 'northEast')).toBeUndefined();
  });
  it('given facing southEast at L-1, returns undefined', () => {
    expect(getRightSpace(standardBoard, 'L-1', 'southEast')).toBeUndefined();
  });
  it('given facing southWest at A-1, returns undefined', () => {
    expect(getRightSpace(standardBoard, 'A-1', 'southWest')).toBeUndefined();
  });
  it('given facing northWest at A-18, returns undefined', () => {
    expect(getRightSpace(standardBoard, 'A-18', 'northWest')).toBeUndefined();
  });

  it('given invalid row letter, throws', () => {
    expect(() =>
      getRightSpace(standardBoard, 'R-12' as StandardBoardCoordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('given invalid column, throws', () => {
    expect(() =>
      getRightSpace(standardBoard, 'A-19' as StandardBoardCoordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('given invalid facing, throws', () => {
    expect(() =>
      getRightSpace(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
