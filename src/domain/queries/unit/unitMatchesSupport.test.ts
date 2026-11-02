import type { UnitSupport } from '@entities';
import { throwIfUndefined } from '@utils';
import { createTestUnit } from '@testing';

import { unitMatchesSupport } from './unitMatchesSupport';

describe('unitMatchesSupport function', () => {
  const unit = createTestUnit('white', { attack: 3 });

  it('matches any unit for generic support', () => {
    const support: UnitSupport = { count: 1, supportType: 'generic' };
    expect(unitMatchesSupport(unit, support)).toBe(true);
  });

  it('returns true when unit-type support uses this type id', () => {
    const support: UnitSupport = {
      count: 2,
      supportType: 'unitType',
      unitTypeId: unit.unitType.id,
    };
    expect(unitMatchesSupport(unit, support)).toBe(true);
  });

  it('returns false when unit-type support names a different id', () => {
    const support: UnitSupport = {
      count: 1,
      supportType: 'unitType',
      unitTypeId: '00000000-0000-4000-8000-000000000099',
    };
    expect(unitMatchesSupport(unit, support)).toBe(false);
  });

  it('returns true when trait support names a trait on the unit', () => {
    const support: UnitSupport = {
      count: 1,
      supportType: 'trait',
      trait: throwIfUndefined(
        unit.unitType.traits[0],
        'test unit must have a trait',
      ),
    };
    expect(unitMatchesSupport(unit, support)).toBe(true);
  });

  it('returns false when trait support names a trait the unit lacks', () => {
    const missingTrait = unit.unitType.traits.includes('cavalry')
      ? 'phalanx'
      : 'cavalry';
    const support: UnitSupport = {
      count: 1,
      supportType: 'trait',
      trait: missingTrait,
    };
    expect(unitMatchesSupport(unit, support)).toBe(false);
  });
});
