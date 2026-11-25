import type { UnitFacing } from '@entities';

import { isDiagonalFacing } from './isDiagonalFacing';

/**
 * Diagonal facing: one of the four diagonals.
 */
describe('isDiagonalFacing function', () => {
  it('northEast is a diagonal facing', () => {
    // Toward a corner of the space.
    expect(isDiagonalFacing('northEast')).toBe(true);
  });

  it('north is not a diagonal facing', () => {
    // Toward a side of the space.
    expect(isDiagonalFacing('north')).toBe(false);
  });

  it('an unknown facing is not a diagonal facing', () => {
    // 'invalid' is not a facing. The cast is what lets the check see a value outside the eight.
    expect(isDiagonalFacing('invalid' as UnitFacing)).toBe(false);
  });
});
