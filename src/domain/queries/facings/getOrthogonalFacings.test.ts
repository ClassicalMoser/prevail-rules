import type { UnitFacing } from '@entities';

import { getOrthogonalFacings } from './getOrthogonalFacings';

/**
 * GetOrthogonalFacings: the two facings 90° from this facing on the compass (perpendicular directions), for
 * both cardinals and diagonals.
 */
describe(getOrthogonalFacings, () => {
  it('given north, returns west and east', () => {
    expect(getOrthogonalFacings('north')).toStrictEqual(
      new Set(['west', 'east']),
    );
  });

  it('given east, returns north and south', () => {
    expect(getOrthogonalFacings('east')).toStrictEqual(
      new Set(['north', 'south']),
    );
  });

  it('given south, returns east and west', () => {
    expect(getOrthogonalFacings('south')).toStrictEqual(
      new Set(['east', 'west']),
    );
  });

  it('given west, returns south and north', () => {
    expect(getOrthogonalFacings('west')).toStrictEqual(
      new Set(['south', 'north']),
    );
  });

  it('given northEast, returns northWest and southEast', () => {
    expect(getOrthogonalFacings('northEast')).toStrictEqual(
      new Set(['northWest', 'southEast']),
    );
  });

  it('given southEast, returns northEast and southWest', () => {
    expect(getOrthogonalFacings('southEast')).toStrictEqual(
      new Set(['northEast', 'southWest']),
    );
  });

  it('given southWest, returns southEast and northWest', () => {
    expect(getOrthogonalFacings('southWest')).toStrictEqual(
      new Set(['southEast', 'northWest']),
    );
  });

  it('given northWest, returns southWest and northEast', () => {
    expect(getOrthogonalFacings('northWest')).toStrictEqual(
      new Set(['southWest', 'northEast']),
    );
  });

  it('given invalid facing, throws', () => {
    expect(() => getOrthogonalFacings('invalid' as UnitFacing)).toThrow(
      new Error('Invalid facing: invalid'),
    );
  });
});
