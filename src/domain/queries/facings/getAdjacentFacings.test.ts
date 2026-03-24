import type { UnitFacing } from '@entities';
import { describe, expect, it } from 'vitest';
import { getAdjacentFacings } from './getAdjacentFacings';

/**
 * getAdjacentFacings: the two facings that bracket this facing on the compass (each cardinal shares its two
 * diagonal neighbors; each diagonal shares its two axis neighbors).
 */
describe('getAdjacentFacings', () => {
  it('given each cardinal facing, returns the two flanking diagonals', () => {
    expect(getAdjacentFacings('north')).toEqual(
      new Set(['northWest', 'northEast']),
    );
    expect(getAdjacentFacings('east')).toEqual(
      new Set(['northEast', 'southEast']),
    );
    expect(getAdjacentFacings('south')).toEqual(
      new Set(['southEast', 'southWest']),
    );
    expect(getAdjacentFacings('west')).toEqual(
      new Set(['southWest', 'northWest']),
    );
  });
  it('given each diagonal facing, returns the two bounding cardinals', () => {
    expect(getAdjacentFacings('northEast')).toEqual(new Set(['north', 'east']));
    expect(getAdjacentFacings('southEast')).toEqual(new Set(['east', 'south']));
    expect(getAdjacentFacings('southWest')).toEqual(new Set(['south', 'west']));
    expect(getAdjacentFacings('northWest')).toEqual(new Set(['west', 'north']));
  });

  it('given invalid facing, throws', () => {
    expect(() => getAdjacentFacings('invalid' as UnitFacing)).toThrow(
      new Error('Invalid facing: invalid'),
    );
  });
});
