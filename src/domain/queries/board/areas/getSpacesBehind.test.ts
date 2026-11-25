import { createEmptyStandardBoard } from '@factories';

import { getSpacesBehind } from './getSpacesBehind';

/**
 * "Behind a unit" is everything on the far side of its back spaces: the
 * line through its own space, across its facing, and every space beyond it
 * the other way. It is the whole back half of the field, not a wedge
 * (§2.3.3). A rear engagement needs the mover to have begun there (§6.2.2),
 * and a retreat must stay in it (§9.1.2).
 */
describe('getSpacesBehind function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const standardBoard = createEmptyStandardBoard();

  it('is every row past the unit’s own on the side it turns its back to', () => {
    // A south-facing unit on row B has row A behind it; row B, its own
    // line, is not behind.
    expect(getSpacesBehind(standardBoard, 'B-7', 'south')).toStrictEqual(
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

  it('reaches out to both side edges, not a wedge behind the unit', () => {
    const behind = getSpacesBehind(standardBoard, 'F-9', 'north');

    // A north-facing unit on row F has rows G to L behind it, eighteen
    // spaces each.
    expect(behind.size).toBe(108);
    // G-1 and L-18 lie far off to its sides, yet they are behind it.
    expect(behind.has('G-1')).toBe(true);
    expect(behind.has('L-18')).toBe(true);
    // Its own row is not behind it.
    expect(behind.has('F-1')).toBe(false);
  });

  it('is the corner past the crossing diagonal when the unit faces a diagonal', () => {
    // Facing north-east from J-3, its back is to the south-west: the ten
    // spaces toward L-1 past the diagonal through J-3 are behind it.
    expect(getSpacesBehind(standardBoard, 'J-3', 'northEast')).toStrictEqual(
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
