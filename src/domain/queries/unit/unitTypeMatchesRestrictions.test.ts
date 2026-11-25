import type { Restrictions } from '@entities';
import { getUnitByTrait } from '@testing';

import { unitTypeMatchesRestrictions } from './unitTypeMatchesRestrictions';

/**
 * A command or round effect carries at most one filter on who it reaches: a
 * list of traits the unit must all have, or a list of types it must be one
 * of (§4.3.4). Inspiration range is asked elsewhere, so every case here
 * prints a range that would not matter.
 */
describe('unitTypeMatchesRestrictions function', () => {
  // A formation unit from the catalog, with its own type id.
  const unitWithFormation = getUnitByTrait('formation');

  it('matches any unit when there is no trait or unit-type filter', () => {
    const restrictions: Restrictions = {
      inspirationRangeRestriction: -1,
      restrictionType: 'none',
    };

    expect(unitTypeMatchesRestrictions(unitWithFormation, restrictions)).toBe(
      true,
    );
  });

  it('matches a unit that has every required trait', () => {
    // A formation order reaches a formation unit.
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'trait',
      traitRestrictions: ['formation'],
    };

    expect(unitTypeMatchesRestrictions(unitWithFormation, restrictions)).toBe(
      true,
    );
  });

  it('rejects a unit that lacks a required trait', () => {
    // A cavalry order does not reach foot.
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'trait',
      traitRestrictions: ['cavalry'],
    };
    // The catalog row must not be cavalry, or the case proves nothing.
    expect(unitWithFormation.traits).not.toContain('cavalry');

    expect(unitTypeMatchesRestrictions(unitWithFormation, restrictions)).toBe(
      false,
    );
  });

  it('matches a unit whose type is listed', () => {
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'unitType',
      unitRestrictions: [unitWithFormation.id],
    };

    expect(unitTypeMatchesRestrictions(unitWithFormation, restrictions)).toBe(
      true,
    );
  });

  it('rejects a unit whose type is not listed', () => {
    // An id no catalog row carries.
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'unitType',
      unitRestrictions: ['00000000-0000-4000-8000-000000000099'],
    };

    expect(unitTypeMatchesRestrictions(unitWithFormation, restrictions)).toBe(
      false,
    );
  });
});
