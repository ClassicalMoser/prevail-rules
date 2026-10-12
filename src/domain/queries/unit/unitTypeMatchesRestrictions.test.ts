import type { Restrictions } from '@entities';
import { getUnitByTrait } from '@testing';

import { unitTypeMatchesRestrictions } from './unitTypeMatchesRestrictions';

/**
 * UnitTypeMatchesRestrictions: a unit type against a trait filter, a unit-type
 * filter, or neither.
 */
describe(unitTypeMatchesRestrictions, () => {
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
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'trait',
      traitRestrictions: ['cavalry'],
    };

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
