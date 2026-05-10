import { createEmptySmallBoard } from '@transforms';

import { getFrontSpaces } from '../adjacency';
import { getSpacesInDirection } from './getSpacesInDirection';

const smallBoard = createEmptySmallBoard();

/**
 * GetSpacesInDirection: flood-fill forward from a seed set of coordinates along a facing until board edge.
 */
describe(getSpacesInDirection, () => {
  it('given south-facing front spaces from B-2, fills southern half-plane', () => {
    const unitFacing = 'south';
    const unitPosition = 'B-2';
    const frontSpaces = getFrontSpaces(smallBoard, unitPosition, unitFacing);
    const result = getSpacesInDirection(smallBoard, frontSpaces, unitFacing);

    expect(result.size).toBe(72);
    expect(result.has('H-1')).toBeTruthy();
    expect(result.has('H-12')).toBeTruthy();
    expect(result.has('A-1')).toBeFalsy();
    expect(result.has('A-12')).toBeFalsy();
    expect(result.has('B-1')).toBeFalsy();
    expect(result.has('B-12')).toBeFalsy();
  });

  it('given northWest-facing front spaces from F-7, fills expected wedge', () => {
    const unitFacing = 'northWest';
    const unitPosition = 'F-7';
    const frontSpaces = getFrontSpaces(smallBoard, unitPosition, unitFacing);
    const result = getSpacesInDirection(smallBoard, frontSpaces, unitFacing);

    expect(result.size).toBe(57);
    expect(result.has('A-1')).toBeTruthy();
    expect(result.has('A-11')).toBeTruthy();
    expect(result.has('A-12')).toBeFalsy();
    expect(result.has('E-6')).toBeTruthy();
    expect(result.has('E-7')).toBeTruthy();
    expect(result.has('E-8')).toBeFalsy();
    expect(result.has('F-6')).toBeTruthy();
    expect(result.has('F-7')).toBeFalsy();
    expect(result.has('F-8')).toBeFalsy();
    expect(result.has('G-6')).toBeFalsy();
    expect(result.has('H-12')).toBeFalsy();
  });
});
