import type { Restrictions } from '@entities';
import type { Trait } from '@ruleValues';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  getUnitByTrait,
  placed,
} from '@testing';

import { canBeOrdered } from './canBeOrdered';

// Inspiration range is not asked here, so an unrestricted order is enough
// for every case that is not about restrictions.
const unrestricted: Restrictions = {
  inspirationRangeRestriction: -1,
  restrictionType: 'none',
};

/**
 * An order may name a unit that is free of an engagement (§4.3.4), has not
 * been commanded this round (§4.3.6), and meets the order's trait and type
 * restrictions.
 */
describe('canBeOrdered function', () => {
  it('names a free, uncommanded unit that meets the restrictions', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const standing = placed(unit, 'E-5', 'north');
    const board = createBoardWithUnits([standing]);

    expect(canBeOrdered(standing, board, unrestricted, [])).toBe(true);
  });

  it('refuses a unit locked in an engagement', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const enemy = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    // Our unit has walked into the enemy: both stand in E-5 (§2.2.1).
    const board = createBoardWithEngagedUnits(unit, enemy, 'E-5', 'north');

    // An engaged unit cannot be ordered (§4.3.4).
    expect(
      canBeOrdered(placed(unit, 'E-5', 'north'), board, unrestricted, []),
    ).toBe(false);
  });

  it('refuses a unit already commanded this round', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const standing = placed(unit, 'E-5', 'north');
    const board = createBoardWithUnits([standing]);

    // One order per unit per round (§4.3.6).
    expect(canBeOrdered(standing, board, unrestricted, [unit])).toBe(false);
  });

  it('refuses a unit missing the trait the order requires', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    // Require a trait this roster row does not have. Do not assume the default.
    const requiredTrait: Trait = unit.unitType.traits.includes('cavalry')
      ? 'phalanx'
      : 'cavalry';
    expect(unit.unitType.traits).not.toContain(requiredTrait);
    const standing = placed(unit, 'E-5', 'north');
    const board = createBoardWithUnits([standing]);
    const traitRestriction: Restrictions = {
      inspirationRangeRestriction: -1,
      restrictionType: 'trait',
      traitRestrictions: [requiredTrait],
    };

    // The order allows only units with that trait (§4.3.4).
    expect(canBeOrdered(standing, board, traitRestriction, [])).toBe(false);
  });

  it('refuses a unit of a type the order does not allow', () => {
    const requiredType = getUnitByTrait('cavalry');
    const otherType = getUnitByTrait('phalanx');
    // The case needs two different roster rows. Call that out; do not assume it.
    expect(otherType.id).not.toBe(requiredType.id);
    const unit = createTestUnit('black', {
      instanceNumber: 1,
      unitType: otherType,
    });
    const standing = placed(unit, 'E-5', 'north');
    const board = createBoardWithUnits([standing]);
    const unitTypeRestriction: Restrictions = {
      inspirationRangeRestriction: -1,
      restrictionType: 'unitType',
      unitRestrictions: [requiredType.id],
    };

    // The order allows only that unit type (§4.3.4).
    expect(canBeOrdered(standing, board, unitTypeRestriction, [])).toBe(false);
  });
});
