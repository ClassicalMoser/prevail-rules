import type { UnitFacing } from '@entities';

import { getOrthogonalFacings } from './getOrthogonalFacings';

/**
 * GetOrthogonalFacings: the two facings 90° from this facing on the compass (perpendicular directions), for
 * both cardinals and diagonals.
 */
describe('getOrthogonalFacings function', () => {
  it('perpendicular to north is west and east', () => {
    expect(getOrthogonalFacings('north')).toStrictEqual(
      new Set(['west', 'east']),
    );
  });

  it('perpendicular to east is north and south', () => {
    expect(getOrthogonalFacings('east')).toStrictEqual(
      new Set(['north', 'south']),
    );
  });

  it('perpendicular to south is east and west', () => {
    expect(getOrthogonalFacings('south')).toStrictEqual(
      new Set(['east', 'west']),
    );
  });

  it('perpendicular to west is south and north', () => {
    expect(getOrthogonalFacings('west')).toStrictEqual(
      new Set(['south', 'north']),
    );
  });

  it('perpendicular to northEast is northWest and southEast', () => {
    expect(getOrthogonalFacings('northEast')).toStrictEqual(
      new Set(['northWest', 'southEast']),
    );
  });

  it('perpendicular to southEast is northEast and southWest', () => {
    expect(getOrthogonalFacings('southEast')).toStrictEqual(
      new Set(['northEast', 'southWest']),
    );
  });

  it('perpendicular to southWest is southEast and northWest', () => {
    expect(getOrthogonalFacings('southWest')).toStrictEqual(
      new Set(['southEast', 'northWest']),
    );
  });

  it('perpendicular to northWest is southWest and northEast', () => {
    expect(getOrthogonalFacings('northWest')).toStrictEqual(
      new Set(['southWest', 'northEast']),
    );
  });

  it('an unknown facing is rejected', () => {
    expect(() => getOrthogonalFacings('invalid' as UnitFacing)).toThrow(
      'Invalid facing: invalid',
    );
  });
});
