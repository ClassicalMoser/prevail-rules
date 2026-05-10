import type { UnitFacing } from '@entities';

import { getAdjacentFacings } from './getAdjacentFacings';

/**
 * GetAdjacentFacings: the two facings that bracket this facing on the compass (each cardinal shares its two
 * diagonal neighbors; each diagonal shares its two axis neighbors).
 */
describe(getAdjacentFacings, () => {
  it('given each cardinal facing, returns the two flanking diagonals', () => {
    expect(getAdjacentFacings('north')).toStrictEqual(
      new Set(['northWest', 'northEast']),
    );
    expect(getAdjacentFacings('east')).toStrictEqual(
      new Set(['northEast', 'southEast']),
    );
    expect(getAdjacentFacings('south')).toStrictEqual(
      new Set(['southEast', 'southWest']),
    );
    expect(getAdjacentFacings('west')).toStrictEqual(
      new Set(['southWest', 'northWest']),
    );
  });

  it('given each diagonal facing, returns the two bounding cardinals', () => {
    expect(getAdjacentFacings('northEast')).toStrictEqual(
      new Set(['north', 'east']),
    );
    expect(getAdjacentFacings('southEast')).toStrictEqual(
      new Set(['east', 'south']),
    );
    expect(getAdjacentFacings('southWest')).toStrictEqual(
      new Set(['south', 'west']),
    );
    expect(getAdjacentFacings('northWest')).toStrictEqual(
      new Set(['west', 'north']),
    );
  });

  it('given invalid facing, throws', () => {
    expect(() => getAdjacentFacings('invalid' as UnitFacing)).toThrow(
      new Error('Invalid facing: invalid'),
    );
  });
});
