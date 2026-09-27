import type { Board, Coordinate, UnitFacing } from '@entities';
import { createEmptyStandardBoard } from '@factories';

import { getRearwardSpace } from './getRearwardSpace';

const standardBoard: Board = createEmptyStandardBoard();

/**
 * GetRearwardSpace: one step backward from a coordinate along the facing (opposite forward); undefined off board;
 * throws on invalid coordinate or facing.
 */
describe(getRearwardSpace, () => {
  it('returns F-5 when facing north at E-5', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'north')).toBe('F-5');
  });

  it('returns E-4 when facing east at E-5', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'east')).toBe('E-4');
  });

  it('returns D-5 when facing south at E-5', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'south')).toBe('D-5');
  });

  it('returns E-6 when facing west at E-5', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'west')).toBe('E-6');
  });

  it('returns F-4 when facing northEast at E-5', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'northEast')).toBe('F-4');
  });

  it('returns D-4 when facing southEast at E-5', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'southEast')).toBe('D-4');
  });

  it('returns D-6 when facing southWest at E-5', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'southWest')).toBe('D-6');
  });

  it('returns F-6 when facing northWest at E-5', () => {
    expect(getRearwardSpace(standardBoard, 'E-5', 'northWest')).toBe('F-6');
  });

  it('returns undefined when facing south at A-1', () => {
    expect(getRearwardSpace(standardBoard, 'A-1', 'south')).toBeUndefined();
  });

  it('returns undefined when facing east at F-1', () => {
    expect(getRearwardSpace(standardBoard, 'F-1', 'east')).toBeUndefined();
  });

  it('returns undefined when facing north at L-5', () => {
    expect(getRearwardSpace(standardBoard, 'L-5', 'north')).toBeUndefined();
  });

  it('returns undefined when facing west at E-18', () => {
    expect(getRearwardSpace(standardBoard, 'E-18', 'west')).toBeUndefined();
  });

  it('returns undefined when facing southWest at A-1', () => {
    expect(getRearwardSpace(standardBoard, 'A-1', 'southWest')).toBeUndefined();
  });

  it('returns undefined when facing southEast at A-18', () => {
    expect(
      getRearwardSpace(standardBoard, 'A-18', 'southEast'),
    ).toBeUndefined();
  });

  it('returns undefined when facing northWest at L-1', () => {
    expect(getRearwardSpace(standardBoard, 'L-1', 'northWest')).toBeUndefined();
  });

  it('returns undefined when facing northEast at L-18', () => {
    expect(
      getRearwardSpace(standardBoard, 'L-18', 'northEast'),
    ).toBeUndefined();
  });

  it('throws when the row letter is invalid', () => {
    expect(() =>
      getRearwardSpace(standardBoard, 'R-12' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid row: R'));
  });

  it('throws when the column is invalid', () => {
    expect(() =>
      getRearwardSpace(standardBoard, 'A-19' as Coordinate, 'north'),
    ).toThrow(new Error('Invalid column: 19'));
  });

  it('throws when the facing is invalid', () => {
    expect(() =>
      getRearwardSpace(standardBoard, 'E-9', 'random' as UnitFacing),
    ).toThrow(new Error('Invalid facing: random'));
  });
});
