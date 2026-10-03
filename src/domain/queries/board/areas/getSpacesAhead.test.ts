import { createEmptySmallBoard, createEmptyStandardBoard } from '@factories';

import { getSpacesAhead } from './getSpacesAhead';

const standardBoard = createEmptyStandardBoard();
const smallBoard = createEmptySmallBoard();

/**
 * GetSpacesAhead: all board spaces strictly in front of the unit's inline line.
 */
describe(getSpacesAhead, () => {
  it('column 1 lies ahead of a west-facing unit at F-2', () => {
    // Column 1, west of the inline line through F-2.
    expect(getSpacesAhead(standardBoard, 'F-2', 'west')).toStrictEqual(
      new Set([
        'A-1',
        'B-1',
        'C-1',
        'D-1',
        'E-1',
        'F-1',
        'G-1',
        'H-1',
        'I-1',
        'J-1',
        'K-1',
        'L-1',
      ]),
    );
  });

  it('row A lies ahead of a north-facing unit at B-7', () => {
    // Row A, north of the inline line through B-7.
    expect(getSpacesAhead(standardBoard, 'B-7', 'north')).toStrictEqual(
      new Set([
        'A-1',
        'A-2',
        'A-3',
        'A-4',
        'A-5',
        'A-6',
        'A-7',
        'A-8',
        'A-9',
        'A-10',
        'A-11',
        'A-12',
        'A-13',
        'A-14',
        'A-15',
        'A-16',
        'A-17',
        'A-18',
      ]),
    );
  });

  it('columns 17 and 18 lie ahead of an east-facing unit at F-16', () => {
    // Columns 17 and 18, east of the inline line through F-16.
    expect(getSpacesAhead(standardBoard, 'F-16', 'east')).toStrictEqual(
      new Set([
        'A-17',
        'A-18',
        'B-17',
        'B-18',
        'C-17',
        'C-18',
        'D-17',
        'D-18',
        'E-17',
        'E-18',
        'F-17',
        'F-18',
        'G-17',
        'G-18',
        'H-17',
        'H-18',
        'I-17',
        'I-18',
        'J-17',
        'J-18',
        'K-17',
        'K-18',
        'L-17',
        'L-18',
      ]),
    );
  });

  it('a-1, B-1, and A-2 lie ahead of a northWest-facing unit at B-2', () => {
    // The three spaces northwest of B-2.
    expect(getSpacesAhead(standardBoard, 'B-2', 'northWest')).toStrictEqual(
      new Set(['A-1', 'B-1', 'A-2']),
    );
  });

  it('the southwest corner lies ahead of a southWest-facing unit at J-3', () => {
    // The southwest corner ahead of J-3.
    expect(getSpacesAhead(standardBoard, 'J-3', 'southWest')).toStrictEqual(
      new Set([
        'I-1',
        'J-1',
        'J-2',
        'K-1',
        'K-2',
        'K-3',
        'L-1',
        'L-2',
        'L-3',
        'L-4',
      ]),
    );
  });

  describe('on a small board', () => {
    it('nothing lies ahead of a southEast-facing unit at corner H-12', () => {
      // The forward semiplane is empty ahead of H-12.
      expect(getSpacesAhead(smallBoard, 'H-12', 'southEast').size).toBe(0);
    });

    it('the southeast semiplane lies ahead of a southEast-facing unit at E-6', () => {
      const result = getSpacesAhead(smallBoard, 'E-6', 'southEast');

      // Spaces ahead of the unit's inline line.
      expect(result.has('F-7')).toBe(true);
      expect(result.has('F-6')).toBe(true);
      expect(result.has('F-8')).toBe(true);
      expect(result.has('G-8')).toBe(true);
      expect(result.has('H-9')).toBe(true);
      // Spaces behind the unit's inline line.
      expect(result.has('D-5')).toBe(false);
      expect(result.has('C-4')).toBe(false);
      // Inline spaces should always be excluded.
      expect(result.has('F-5')).toBe(false);
      expect(result.has('D-7')).toBe(false);
      // Coordinates past the edge of the small board.
      expect(result.has('A-18')).toBe(false);
      expect(result.has('L-18')).toBe(false);
      expect(result.has('L-1')).toBe(false);
    });
  });
});
