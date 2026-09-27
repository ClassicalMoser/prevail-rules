import type { UnitSupport } from '@entities';
import { createTestUnit } from '@testing';

import { unitMatchesSupport } from './unitMatchesSupport';

describe(unitMatchesSupport, () => {
  const unit = createTestUnit('white', { attack: 3 });

  it('given generic support, matches any unit', () => {
    const support: UnitSupport = { count: 1, supportType: 'generic' };
    expect(unitMatchesSupport(unit, support)).toBe(true);
  });

  it('given unitType support matching the unit type id, returns true', () => {
    const support: UnitSupport = {
      count: 2,
      supportType: 'unitType',
      unitTypeId: unit.unitType.id,
    };
    expect(unitMatchesSupport(unit, support)).toBe(true);
  });

  it('given unitType support for a different type, returns false', () => {
    const support: UnitSupport = {
      count: 1,
      supportType: 'unitType',
      unitTypeId: '00000000-0000-4000-8000-000000000099',
    };
    expect(unitMatchesSupport(unit, support)).toBe(false);
  });

  it('given trait support the unit has, returns true', () => {
    const support: UnitSupport = {
      count: 1,
      supportType: 'trait',
      trait: unit.unitType.traits[0]!,
    };
    expect(unitMatchesSupport(unit, support)).toBe(true);
  });

  it('given trait support the unit lacks, returns false', () => {
    const missingTrait = unit.unitType.traits.includes('mounted')
      ? 'phalanx'
      : 'mounted';
    const support: UnitSupport = {
      count: 1,
      supportType: 'trait',
      trait: missingTrait,
    };
    expect(unitMatchesSupport(unit, support)).toBe(false);
  });
});
