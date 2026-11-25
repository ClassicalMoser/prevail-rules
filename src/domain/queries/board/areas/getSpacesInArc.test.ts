import { createEmptyStandardBoard } from '@factories';

import { getSpacesInArc } from './getSpacesInArc';

/**
 * A shooter's forward arc (§2.4.3): its three front spaces are arc 1, the
 * front spaces of each of those are added for arc 2, and so on out to its
 * Range. The result is a widening cone; the shooter's own space is not in it,
 * and the board edge cuts it short.
 */
describe('getSpacesInArc function', () => {
  // The standard board, rows A to L and columns 1 to 18.
  const board = createEmptyStandardBoard();

  it('widens by one space to each side with each rank for an orthogonal facing', () => {
    // Range 2 south from E-7: three spaces on row F, then five on row G.
    // Nothing on row H, which Range 2 does not reach.
    expect(getSpacesInArc(board, 'E-7', 'south', 2)).toStrictEqual(
      new Set(['F-6', 'F-7', 'F-8', 'G-5', 'G-6', 'G-7', 'G-8', 'G-9']),
    );
  });

  it('fills a square toward the corner it faces for a diagonal facing', () => {
    // Range 3 south-east from B-10: every space up to three rows south and
    // three columns east, but not B-10 itself.
    expect(getSpacesInArc(board, 'B-10', 'southEast', 3)).toStrictEqual(
      new Set([
        'B-11',
        'B-12',
        'B-13',
        'C-10',
        'C-11',
        'C-12',
        'C-13',
        'D-10',
        'D-11',
        'D-12',
        'D-13',
        'E-10',
        'E-11',
        'E-12',
        'E-13',
      ]),
    );
  });

  it('is cut short on the side where the cone meets the board edge', () => {
    // Range 2 east from B-5 would widen past row A; only the spaces on the
    // board remain, so the second rank keeps four of its five.
    expect(getSpacesInArc(board, 'B-5', 'east', 2)).toStrictEqual(
      new Set(['A-6', 'B-6', 'C-6', 'A-7', 'B-7', 'C-7', 'D-7']),
    );
  });

  it('is empty when the shooter faces the board edge it stands on', () => {
    // North of row A there is no first rank, so no later rank begins.
    expect(getSpacesInArc(board, 'A-5', 'north', 2)).toStrictEqual(new Set());
  });
});
