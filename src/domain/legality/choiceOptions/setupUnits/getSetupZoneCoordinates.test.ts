import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from '@factories';

import { getSetupZoneCoordinates } from './getSetupZoneCoordinates';

/**
 * GetSetupZoneCoordinates: provisional back-3 / trim-2 deployment belts.
 *
 * On a bare board each side deploys in the three rows nearest its own edge,
 * less the two columns at each end: those are the open flanks, and nobody
 * begins in them (§3.5.4). White's edge is the north, row A; Black's the
 * south.
 */
describe('getSetupZoneCoordinates function', () => {
  it('gives white the northernmost three rows on a standard board, columns 3–16', () => {
    const board = createEmptyStandardBoard();
    const zone = getSetupZoneCoordinates(board, 'white');

    // The belt's corners are in; the flank columns and the fourth row are not.
    expect(zone).toContain('A-3');
    expect(zone).toContain('C-16');
    expect(zone).not.toContain('A-1');
    expect(zone).not.toContain('A-2');
    expect(zone).not.toContain('A-17');
    expect(zone).not.toContain('A-18');
    expect(zone).not.toContain('D-3');
    // Three rows of 14, the zone's width on a standard board.
    expect(zone).toHaveLength(42);
  });

  it('gives black the southernmost three rows on a standard board, columns 3–16', () => {
    const board = createEmptyStandardBoard();
    const zone = getSetupZoneCoordinates(board, 'black');

    // Rows J to L are the last three of twelve.
    expect(zone).toContain('J-3');
    expect(zone).toContain('L-16');
    expect(zone).not.toContain('I-3');
    expect(zone).not.toContain('L-1');
    // Three rows of 14, as White's.
    expect(zone).toHaveLength(42);
  });

  it('scales to small and large boards via layout', () => {
    const small = getSetupZoneCoordinates(createEmptySmallBoard(), 'white');
    const large = getSetupZoneCoordinates(createEmptyLargeBoard(), 'black');

    // The small board is 12 wide, so its zone is three rows of 8.
    expect(small).toContain('A-3');
    expect(small).toContain('C-10');
    expect(small).toHaveLength(24);

    // The large board is 24 deep and 36 wide: rows V to X, three rows of 32.
    expect(large).toContain('V-3');
    expect(large).toContain('X-34');
    expect(large).toHaveLength(96);
  });
});
