import { createEmptyStandardBoard } from '@factories';

import { getSpacesAhead } from './getSpacesAhead';

/**
 * The spaces ahead of a unit: the whole half of the board past the line
 * through its own space, across its facing, the way it faces. The line
 * itself is not ahead.
 */
describe('getSpacesAhead function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is every row past the unit’s own when it faces along a column', () => {
    // North of row B lies row A alone, all eighteen columns of it; row B,
    // the unit's own line, is not ahead.
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

  it('is the corner past the crossing diagonal when the unit faces a diagonal', () => {
    // Facing south-west from J-3, the line through it runs north-west to
    // south-east; the ten spaces beyond it, toward L-1, are ahead, with no
    // gaps between the diagonal ranks.
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
});
