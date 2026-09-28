import { createEmptySmallBoard } from '@factories';

import { getHalfPlaneInDirection } from './getHalfPlaneInDirection';

const smallBoard = createEmptySmallBoard();

/**
 * GetHalfPlaneInDirection starts from the spaces directly ahead, adds the
 * inline line through each of them (perpendicular to the facing, so a diagonal
 * fill does not checkerboard), then walks every collected space forward to
 * the edge. The coordinate's own inline line stays out. When nothing lies
 * ahead, the semiplane is empty.
 */
describe(getHalfPlaneInDirection, () => {
  it('nothing lies ahead of a north-facing unit at A-1', () => {
    expect(getHalfPlaneInDirection(smallBoard, 'A-1', 'north').size).toBe(0);
  });

  it('fills the rows south of B from a south-facing unit at B-2', () => {
    const result = getHalfPlaneInDirection(smallBoard, 'B-2', 'south');

    // 72 spaces in the semiplane south of B-2.
    expect(result.size).toBe(72);
    // Spaces that should be included in the semiplane.
    expect(result.has('H-1')).toBe(true);
    expect(result.has('H-12')).toBe(true);
    // Spaces that should not be included in the semiplane.
    expect(result.has('A-1')).toBe(false);
    expect(result.has('A-12')).toBe(false);
    // Inline spaces should always be excluded.
    expect(result.has('B-1')).toBe(false);
    expect(result.has('B-12')).toBe(false);
  });

  it('fills the northwest wedge in front of F-7', () => {
    const result = getHalfPlaneInDirection(smallBoard, 'F-7', 'northWest');

    // 57 spaces in the semiplane northwest of F-7.
    expect(result.size).toBe(57);
    // Spaces that should be included in the semiplane.
    expect(result.has('A-1')).toBe(true);
    expect(result.has('A-11')).toBe(true);
    expect(result.has('E-6')).toBe(true);
    expect(result.has('E-7')).toBe(true);
    expect(result.has('F-6')).toBe(true);
    // Spaces that should not be included in the semiplane.
    expect(result.has('F-8')).toBe(false);
    expect(result.has('H-12')).toBe(false);
    // Inline spaces should always be excluded.
    expect(result.has('A-12')).toBe(false);
    expect(result.has('E-8')).toBe(false);
    expect(result.has('F-7')).toBe(false);
    expect(result.has('G-6')).toBe(false);
  });
});
