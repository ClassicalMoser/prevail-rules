import type { UnitFacing } from '@entities';

import { isDiagonalFacing } from './isDiagonalFacing';

/**
 * Diagonal facing: one of the four diagonals.
 */
describe(isDiagonalFacing, () => {
  it('northEast is a diagonal facing', () => {
    expect(isDiagonalFacing('northEast')).toStrictEqual({
      result: true,
    });
  });

  it('north is not a diagonal facing', () => {
    expect(isDiagonalFacing('north')).toStrictEqual({
      errorReason: 'Facing is not a diagonal facing',
      result: false,
    });
  });

  it('an unknown facing is not a diagonal facing', () => {
    expect(isDiagonalFacing('invalid' as UnitFacing)).toStrictEqual({
      errorReason: 'Facing is not a diagonal facing',
      result: false,
    });
  });
});
