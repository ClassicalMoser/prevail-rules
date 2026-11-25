import type { UnitSupport } from '@entities';
import { createTestUnit, getUnitByTrait } from '@testing';

import { unitMatchesSupport } from './unitMatchesSupport';

/**
 * After a rally each unit on the board needs a place, and may take one only
 * in a stack it matches (§10.4.4): any unit for generic support, a unit of
 * the trait for trait support, a unit of the type for unit-type support.
 */
describe('unitMatchesSupport function', () => {
  // White's Punic Citizen Spearmen: formation, phalanx and melee (§15). The
  // traits are written out so a case can name one the unit lacks.
  const unit = createTestUnit('white', {
    unitType: {
      ...getUnitByTrait('formation'),
      traits: ['formation', 'phalanx', 'melee'],
    },
  });

  it('matches any unit for generic support', () => {
    // A generic place holds any unit at all.
    const support: UnitSupport = { count: 1, supportType: 'generic' };

    expect(unitMatchesSupport(unit, support)).toBe(true);
  });

  it('matches trait support for any trait the unit has, and no other', () => {
    // The spearmen may go in a formation stack or a phalanx stack …
    const formation: UnitSupport = {
      count: 2,
      supportType: 'trait',
      trait: 'formation',
    };
    const phalanx: UnitSupport = {
      count: 2,
      supportType: 'trait',
      trait: 'phalanx',
    };
    expect(unitMatchesSupport(unit, formation)).toBe(true);
    expect(unitMatchesSupport(unit, phalanx)).toBe(true);

    // … but not a cavalry stack.
    const cavalry: UnitSupport = {
      count: 2,
      supportType: 'trait',
      trait: 'cavalry',
    };
    expect(unitMatchesSupport(unit, cavalry)).toBe(false);
  });

  it('matches unit-type support only for its own type', () => {
    // A place for this very unit type takes it …
    const ownType: UnitSupport = {
      count: 2,
      supportType: 'unitType',
      unitTypeId: unit.unitType.id,
    };
    expect(unitMatchesSupport(unit, ownType)).toBe(true);

    // … and a place for another type, an id no catalog row carries, does not.
    const otherType: UnitSupport = {
      count: 1,
      supportType: 'unitType',
      unitTypeId: '00000000-0000-4000-8000-000000000099',
    };
    expect(unitMatchesSupport(unit, otherType)).toBe(false);
  });
});
