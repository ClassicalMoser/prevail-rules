import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from '@transforms';

import {
  getSetupZoneCoordinates,
  SETUP_ZONE_BACK_ROWS,
  SETUP_ZONE_EXCLUDED_SIDE_RANKS,
} from './getSetupZoneCoordinates';

/**
 * GetSetupZoneCoordinates: provisional back-3 / trim-2 deployment belts.
 */
describe(getSetupZoneCoordinates, () => {
  it('gives white the northernmost three rows on a standard board, columns 3–16', () => {
    const board = createEmptyStandardBoard();
    const zone = getSetupZoneCoordinates(board, 'white');

    expect(zone).toContain('A-3');
    expect(zone).toContain('C-16');
    expect(zone).not.toContain('A-1');
    expect(zone).not.toContain('A-2');
    expect(zone).not.toContain('A-17');
    expect(zone).not.toContain('A-18');
    expect(zone).not.toContain('D-3');
    expect(zone).toHaveLength(
      SETUP_ZONE_BACK_ROWS * (18 - SETUP_ZONE_EXCLUDED_SIDE_RANKS * 2),
    );
  });

  it('gives black the southernmost three rows on a standard board, columns 3–16', () => {
    const board = createEmptyStandardBoard();
    const zone = getSetupZoneCoordinates(board, 'black');

    expect(zone).toContain('J-3');
    expect(zone).toContain('L-16');
    expect(zone).not.toContain('I-3');
    expect(zone).not.toContain('L-1');
    expect(zone).toHaveLength(
      SETUP_ZONE_BACK_ROWS * (18 - SETUP_ZONE_EXCLUDED_SIDE_RANKS * 2),
    );
  });

  it('scales to small and large boards via layout', () => {
    const small = getSetupZoneCoordinates(createEmptySmallBoard(), 'white');
    const large = getSetupZoneCoordinates(createEmptyLargeBoard(), 'black');

    expect(small).toContain('A-3');
    expect(small).toContain('C-10');
    expect(small).toHaveLength(
      SETUP_ZONE_BACK_ROWS * (12 - SETUP_ZONE_EXCLUDED_SIDE_RANKS * 2),
    );

    expect(large).toContain('V-3');
    expect(large).toContain('X-34');
    expect(large).toHaveLength(
      SETUP_ZONE_BACK_ROWS * (36 - SETUP_ZONE_EXCLUDED_SIDE_RANKS * 2),
    );
  });
});
