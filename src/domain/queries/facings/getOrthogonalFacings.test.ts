import type { UnitFacing } from '@entities';
import { describe, expect, it } from 'vitest';
import { getOrthogonalFacings } from './getOrthogonalFacings';

/**
 * getOrthogonalFacings: the two facings 90° from this facing on the compass (perpendicular directions), for
 * both cardinals and diagonals.
 */
describe('getOrthogonalFacings', () => {
  it('given north, returns west and east', () => {
    expect(getOrthogonalFacings('north')).toEqual(new Set(['west', 'east']));
  });
  it('given east, returns north and south', () => {
    expect(getOrthogonalFacings('east')).toEqual(new Set(['north', 'south']));
  });
  it('given south, returns east and west', () => {
    expect(getOrthogonalFacings('south')).toEqual(new Set(['east', 'west']));
  });
  it('given west, returns south and north', () => {
    expect(getOrthogonalFacings('west')).toEqual(new Set(['south', 'north']));
  });

  it('given northEast, returns northWest and southEast', () => {
    expect(getOrthogonalFacings('northEast')).toEqual(
      new Set(['northWest', 'southEast']),
    );
  });
  it('given southEast, returns northEast and southWest', () => {
    expect(getOrthogonalFacings('southEast')).toEqual(
      new Set(['northEast', 'southWest']),
    );
  });
  it('given southWest, returns southEast and northWest', () => {
    expect(getOrthogonalFacings('southWest')).toEqual(
      new Set(['southEast', 'northWest']),
    );
  });
  it('given northWest, returns southWest and northEast', () => {
    expect(getOrthogonalFacings('northWest')).toEqual(
      new Set(['southWest', 'northEast']),
    );
  });

  it('given invalid facing, throws', () => {
    expect(() => getOrthogonalFacings('invalid' as UnitFacing)).toThrow(
      new Error('Invalid facing: invalid'),
    );
  });
});
