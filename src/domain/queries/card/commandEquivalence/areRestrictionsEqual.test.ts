import type { Restrictions } from '@entities';

import { areRestrictionsEqual } from './areRestrictionsEqual';

/**
 * AreRestrictionsEqual: Compares two Restrictions objects for equality by comparing all properties.
 */
describe(areRestrictionsEqual, () => {
  it('restrictions match themselves', () => {
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 2,
      restrictionType: 'trait',
      traitRestrictions: ['formation'],
    };
    expect(areRestrictionsEqual(restrictions, restrictions)).toBe(true);
  });

  it('identical restrictions match', () => {
    const restrictions1: Restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'none',
    };
    const restrictions2: Restrictions = {
      inspirationRangeRestriction: 1,
      restrictionType: 'none',
    };
    expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
  });

  it('different objects with the same values match', () => {
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

  it('a trait filter does not match a unit-type filter', () => {
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

  describe('inspiration range', () => {
    it('a missing inspiration range matches', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: -1,
        restrictionType: 'none',
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: -1,
        restrictionType: 'none',
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('different inspiration ranges do not match', () => {
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

    it('a missing inspiration range does not match a set range', () => {
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

  describe('trait restrictions', () => {
    it('the same traits match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['formation', 'skirmisher'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'trait',
        traitRestrictions: ['formation', 'skirmisher'],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('the same traits in a different order match', () => {
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

    it('different trait list lengths do not match', () => {
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

    it('different traits do not match', () => {
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
    it('the same unit types match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-1', 'unit-id-2'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        restrictionType: 'unitType',
        unitRestrictions: ['unit-id-1', 'unit-id-2'],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('the same unit types in a different order match', () => {
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

    it('different unit list lengths do not match', () => {
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

    it('different unit types do not match', () => {
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
});
