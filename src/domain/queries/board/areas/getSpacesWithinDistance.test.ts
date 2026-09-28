import { createEmptyStandardBoard } from '@factories';

import { getSpacesWithinDistance } from './getSpacesWithinDistance';

const standardBoard = createEmptyStandardBoard();

/**
 * GetSpacesWithinDistance: Chebyshev distance (king moves): all coordinates within N steps including diagonals.
 */
describe(getSpacesWithinDistance, () => {
  it('nothing is within a negative distance', () => {
    expect(getSpacesWithinDistance(standardBoard, 'E-5', -1)).toStrictEqual(
      new Set(),
    );
  });

  it('only E-5 is within distance 0', () => {
    expect(getSpacesWithinDistance(standardBoard, 'E-5', 0)).toStrictEqual(
      new Set(['E-5']),
    );
  });

  it('distance 1 from E-5 is the start plus its eight neighbors', () => {
    const result = getSpacesWithinDistance(standardBoard, 'E-5', 1);
    expect(result).toStrictEqual(
      new Set(['E-5', 'D-4', 'D-5', 'D-6', 'E-4', 'E-6', 'F-4', 'F-5', 'F-6']),
    );
  });

  it('distance 2 from E-5 is the 5 by 5 square around it', () => {
    const result = getSpacesWithinDistance(standardBoard, 'E-5', 2);

    // 25 spaces, a 5 by 5 square.
    expect(result.size).toBe(25);
    // Inside the square, from the origin out to a corner.
    expect(result.has('E-5')).toBe(true);
    expect(result.has('D-5')).toBe(true);
    expect(result.has('D-4')).toBe(true);
    expect(result.has('C-5')).toBe(true);
    expect(result.has('C-4')).toBe(true);
    expect(result.has('C-3')).toBe(true);
    expect(result.has('C-7')).toBe(true);
    expect(result.has('G-3')).toBe(true);
    expect(result.has('G-7')).toBe(true);
    // One step past the square.
    expect(result.has('B-5')).toBe(false);
    expect(result.has('H-5')).toBe(false);
    expect(result.has('E-2')).toBe(false);
    expect(result.has('E-8')).toBe(false);
  });

  it('distance 1 from corner A-1 is the four in-bounds spaces', () => {
    const result = getSpacesWithinDistance(standardBoard, 'A-1', 1);
    expect(result.has('A-1')).toBe(true);
    expect(result.has('A-2')).toBe(true);
    expect(result.has('B-1')).toBe(true);
    expect(result.has('B-2')).toBe(true);
    expect(result.size).toBe(4);
  });

  it('distance 1 from edge A-5 is six spaces', () => {
    const result = getSpacesWithinDistance(standardBoard, 'A-5', 1);
    expect(result.has('A-5')).toBe(true);
    expect(result.has('A-4')).toBe(true);
    expect(result.has('A-6')).toBe(true);
    expect(result.has('B-4')).toBe(true);
    expect(result.has('B-5')).toBe(true);
    expect(result.has('B-6')).toBe(true);
    expect(result.size).toBe(6);
  });

  it('distance 3 from E-5 is the 7 by 7 square around it', () => {
    const result = getSpacesWithinDistance(standardBoard, 'E-5', 3);

    // 49 spaces, a 7 by 7 square.
    expect(result.size).toBe(49);
    // North ray from the origin to the edge of the square.
    expect(result.has('E-5')).toBe(true);
    expect(result.has('D-5')).toBe(true);
    expect(result.has('C-5')).toBe(true);
    expect(result.has('B-5')).toBe(true);
    // Corners of that square.
    expect(result.has('B-2')).toBe(true);
    expect(result.has('B-8')).toBe(true);
    expect(result.has('H-2')).toBe(true);
    expect(result.has('H-8')).toBe(true);
    // One step past the square.
    expect(result.has('A-5')).toBe(false);
    expect(result.has('I-5')).toBe(false);
    expect(result.has('E-1')).toBe(false);
    expect(result.has('E-9')).toBe(false);
  });
});
