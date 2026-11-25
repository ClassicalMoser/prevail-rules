import type { Restrictions } from '@entities';

import { areRestrictionsEqual } from './areRestrictionsEqual';

/**
 * A command or round effect reaches the units its restrictions allow: how far
 * from the commander (§4.2.7), and which traits or unit types (§4.3.4). Two
 * restrictions are the same when they reach the same units.
 */
describe('areRestrictionsEqual function', () => {
  it('holds for two copies written out separately', () => {
    // Skirmishers within three spaces of the commander, on both.
    const restrictions1: Restrictions = {
      inspirationRangeRestriction: 3,
      restrictionType: 'trait',
      traitRestrictions: ['skirmisher'],
    };
    const restrictions2: Restrictions = {
      inspirationRangeRestriction: 3,
      restrictionType: 'trait',
      traitRestrictions: ['skirmisher'],
    };

    expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
  });

  describe('inspiration range', () => {
    it('fails when one reaches further from the commander', () => {
      // One space against two.
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'none',
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 2,
        restrictionType: 'none',
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });

    it('fails when only one is printed unrestricted', () => {
      // A range printed "—" (stored as −1) reaches every unit; a range of 1
      // does not.
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: -1,
        restrictionType: 'none',
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'none',
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });
  });

  describe('filter', () => {
    it('fails when only one names a trait', () => {
      // An order for any unit is not an order for formation units, at the
      // same range.
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'none',
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['formation'],
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });

    it('fails when one filters by trait and the other by unit type', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['formation'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-1'],
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });
  });

  describe('trait restrictions', () => {
    it('holds for the same traits in either order', () => {
      // A unit must have every listed trait, so the order they are printed
      // in reaches the same units.
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['formation', 'skirmisher'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['skirmisher', 'formation'],
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('fails when one requires a trait more', () => {
      // Formation and skirmisher reach fewer units than formation alone.
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['formation'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['formation', 'skirmisher'],
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });

    it('fails when the traits differ', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['formation'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['skirmisher'],
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });
  });

  describe('unit restrictions', () => {
    it('holds for the same unit types in either order', () => {
      // A unit must be one of the listed types, in whatever order.
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-1', 'unit-id-2'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-2', 'unit-id-1'],
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('fails when one lists a unit type more', () => {
      // Two types reach more units than one.
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-1'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-1', 'unit-id-2'],
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });

    it('fails when the unit types differ', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-1'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-2'],
      };

      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });
  });

  it('throws on a restriction of a kind the rules do not name', () => {
    // Only no filter, a trait filter and a unit-type filter exist; the type
    // forbids any other, so the spec forces the same unknown kind through on
    // both sides to get past the comparison of kinds.
    const unknown = {
      inspirationRangeRestriction: 0,
      restrictionType: 'tribal',
    } as never;

    expect(() => areRestrictionsEqual(unknown, unknown)).toThrow(
      'Unknown restriction type: tribal',
    );
  });
});
