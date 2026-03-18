import { createEmptySmallBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { getFrontSpaces } from '../adjacency';
import { getSpacesInDirection } from './getSpacesInDirection';

const smallBoard = createEmptySmallBoard();

describe('getSpacesInDirection', () => {
  it('should include everything forward of the front spaces for a south-facing unit', () => {
    const unitFacing = 'south';
    const unitPosition = 'B-2';
    const frontSpaces = getFrontSpaces(smallBoard, unitPosition, unitFacing);
    const result = getSpacesInDirection(smallBoard, frontSpaces, unitFacing);

    expect(result.size).toBe(72);
    expect(result.has('H-1')).toBe(true);
    expect(result.has('H-12')).toBe(true);
    expect(result.has('A-1')).toBe(false);
    expect(result.has('A-12')).toBe(false);
    expect(result.has('B-1')).toBe(false);
    expect(result.has('B-12')).toBe(false);
  });
  it('should include everything forward of the inline spaces for a northWest-facing unit', () => {
    const unitFacing = 'northWest';
    const unitPosition = 'F-7';
    const frontSpaces = getFrontSpaces(smallBoard, unitPosition, unitFacing);
    const result = getSpacesInDirection(smallBoard, frontSpaces, unitFacing);

    expect(result.size).toBe(57);
    expect(result.has('A-1')).toBe(true);
    expect(result.has('A-11')).toBe(true);
    expect(result.has('A-12')).toBe(false);
    expect(result.has('E-6')).toBe(true);
    expect(result.has('E-7')).toBe(true);
    expect(result.has('E-8')).toBe(false);
    expect(result.has('F-6')).toBe(true);
    expect(result.has('F-7')).toBe(false);
    expect(result.has('F-8')).toBe(false);
    expect(result.has('G-6')).toBe(false);
    expect(result.has('H-12')).toBe(false);
  });
});
