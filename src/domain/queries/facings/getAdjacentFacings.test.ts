import type { UnitFacing } from '@entities';

import { getAdjacentFacings } from './getAdjacentFacings';

/**
 * Adjacent facings: the two neighbors one step, 45 degrees, to either side.
 */
describe(getAdjacentFacings, () => {
  it('each cardinal facing has its two diagonal neighbors', () => {
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

  it('each diagonal facing has its two cardinal neighbors', () => {
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

  it('an unknown facing is rejected', () => {
    expect(() => getAdjacentFacings('invalid' as UnitFacing)).toThrow(
      'Invalid facing: invalid',
    );
  });
});
