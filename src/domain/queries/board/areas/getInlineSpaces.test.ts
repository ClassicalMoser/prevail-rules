import { createEmptyStandardBoard } from '@factories';

import { getInlineSpaces } from './getInlineSpaces';

/**
 * The line through a unit's own space across its facing, run out to the
 * board edge on both sides, the space itself included. The half-planes ahead
 * and behind (§2.3.3) begin past this line.
 */
describe('getInlineSpaces function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is the unit’s whole row when it faces along a column', () => {
    // Facing south from A-1, the line across that facing is row A, end to end.
    expect(getInlineSpaces(standardBoard, 'A-1', 'south')).toStrictEqual(
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

  it('is the crossing diagonal when the unit faces a diagonal', () => {
    // Facing north-east from E-5, the line runs north-west to A-1 and
    // south-east to L-12, square across the facing.
    expect(getInlineSpaces(standardBoard, 'E-5', 'northEast')).toStrictEqual(
      new Set([
        'A-1',
        'B-2',
        'C-3',
        'D-4',
        'E-5',
        'F-6',
        'G-7',
        'H-8',
        'I-9',
        'J-10',
        'K-11',
        'L-12',
      ]),
    );
  });

  it('is the unit’s space alone in a corner both ends of the line leave', () => {
    // Facing north-west from A-1, the line would run south-west and
    // north-east, and both leave the board at once.
    expect(getInlineSpaces(standardBoard, 'A-1', 'northWest')).toStrictEqual(
      new Set(['A-1']),
    );
  });
});
