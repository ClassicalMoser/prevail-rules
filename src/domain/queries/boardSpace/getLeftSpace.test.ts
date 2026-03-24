import type {
  StandardBoard,
  StandardBoardCoordinate,
  UnitFacing,
} from '@entities';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getLeftSpace } from './getLeftSpace';

const standardBoard: StandardBoard = createEmptyStandardBoard();

/**
 * getLeftSpace: one step to the unit's left from a coordinate and facing; undefined if off the board; throws on
 * invalid coordinate or facing.
 */
describe('getLeftSpace', () => {
  it('given facing north at E-5, returns E-4', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'north')).toBe('E-4');
  });
  it('given facing east at E-5, returns D-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'east')).toBe('D-5');
  });
  it('given facing south at E-5, returns E-6', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'south')).toBe('E-6');
  });
  it('given facing west at E-5, returns F-5', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'west')).toBe('F-5');
  });

  it('given facing northEast at E-5, returns D-4', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'northEast')).toBe('D-4');
  });
  it('given facing southEast at E-5, returns D-6', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'southEast')).toBe('D-6');
  });
  it('given facing southWest at E-5, returns F-6', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'southWest')).toBe('F-6');
  });
  it('given facing northWest at E-5, returns F-4', () => {
    expect(getLeftSpace(standardBoard, 'E-5', 'northWest')).toBe('F-4');
  });

  it('given facing north at E-1, returns undefined', () => {
    expect(getLeftSpace(standardBoard, 'E-1', 'north')).toBeUndefined();
  });
  it('given facing east at A-5, returns undefined', () => {
    expect(getLeftSpace(standardBoard, 'A-5', 'east')).toBeUndefined();
  });
  it('given facing south at E-18, returns undefined', () => {
    expect(getLeftSpace(standardBoard, 'E-18', 'south')).toBeUndefined();
  });
  it('given facing west at L-5, returns undefined', () => {
    expect(getLeftSpace(standardBoard, 'L-5', 'west')).toBeUndefined();
  });

  it('given facing northEast at A-1, returns undefined', () => {
    expect(getLeftSpace(standardBoard, 'A-1', 'northEast')).toBeUndefined();
  });
  it('given facing southEast at A-18, returns undefined', () => {
    expect(getLeftSpace(standardBoard, 'A-18', 'southEast')).toBeUndefined();
  });
  it('given facing southWest at L-1, returns undefined', () => {
    expect(getLeftSpace(standardBoard, 'L-1', 'southWest')).toBeUndefined();
  });
  it('given facing northWest at L-18, returns undefined', () => {
    expect(getLeftSpace(standardBoard, 'L-18', 'northWest')).toBeUndefined();
  });

  it('given invalid row letter, throws', () => {
    expect(() =>
      getLeftSpace(standardBoard, 'R-12' as StandardBoardCoordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('given invalid column, throws', () => {
    expect(() =>
      getLeftSpace(standardBoard, 'A-19' as StandardBoardCoordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('given invalid facing, throws', () => {
    expect(() =>
      getLeftSpace(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
