import type { Restrictions } from '@entities';

import { areRestrictionsEqual } from './areRestrictionsEqual';

/**
 * AreRestrictionsEqual: Compares two Restrictions objects for equality by comparing all properties.
 */
describe(areRestrictionsEqual, () => {
  it('restrictions match themselves', () => {
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 2,
      traitRestrictions: ['sword'],
      unitRestrictions: ['unit-id-1'],
    };
    expect(areRestrictionsEqual(restrictions, restrictions)).toBe(true);
  });

  it('identical restrictions match', () => {
    const restrictions1: Restrictions = {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    };
    const restrictions2: Restrictions = {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    };
    expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
  });

  it('different objects with the same values match', () => {
    const restrictions1: Restrictions = {
      inspirationRangeRestriction: 3,
      traitRestrictions: ['skirmish'],
      unitRestrictions: ['unit-id-2'],
    };
    const restrictions2: Restrictions = {
      inspirationRangeRestriction: 3,
      traitRestrictions: ['skirmish'],
      unitRestrictions: ['unit-id-2'],
    };
    expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
  });

  it('arrays with multiple members do match', () => {
    const restrictions1: Restrictions = {
      inspirationRangeRestriction: 1,
      traitRestrictions: ['sword', 'skirmish'],
      unitRestrictions: ['unit-id-1', 'unit-id-2'],
    };
    const restrictions2: Restrictions = {
      inspirationRangeRestriction: 1,
      traitRestrictions: ['sword', 'skirmish'],
      unitRestrictions: ['unit-id-1', 'unit-id-2'],
    };
    expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
  });

  it('arrays with multiple members in a different order do match', () => {
    const restrictions1: Restrictions = {
      inspirationRangeRestriction: 1,
      traitRestrictions: ['sword', 'skirmish'],
      unitRestrictions: ['unit-id-1', 'unit-id-2'],
    };
    const restrictions2: Restrictions = {
      inspirationRangeRestriction: 1,
      traitRestrictions: ['skirmish', 'sword'],
      unitRestrictions: ['unit-id-2', 'unit-id-1'],
    };
    expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
  });

  describe('inspiration range', () => {
    it('a missing inspiration range matches', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: -1,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: -1,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('different inspiration ranges do not match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 2,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });

    it('a missing inspiration range does not match a set range', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: -1,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });
  });

  describe('trait restrictions', () => {
    it('the same traits match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword', 'skirmish'],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword', 'skirmish'],
        unitRestrictions: [],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('the same traits in a different order match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword', 'skirmish'],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['skirmish', 'sword'],
        unitRestrictions: [],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('different trait list lengths do not match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword'],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword', 'skirmish'],
        unitRestrictions: [],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });

    it('different traits do not match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['sword'],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ['skirmish'],
        unitRestrictions: [],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });
  });

  describe('unit restrictions', () => {
    it('the same unit types match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ['unit-id-1', 'unit-id-2'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ['unit-id-1', 'unit-id-2'],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('the same unit types in a different order match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ['unit-id-1', 'unit-id-2'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ['unit-id-2', 'unit-id-1'],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(true);
    });

    it('different unit list lengths do not match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ['unit-id-1'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ['unit-id-1', 'unit-id-2'],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });

    it('different unit types do not match', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ['unit-id-1'],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ['unit-id-2'],
      };
      expect(areRestrictionsEqual(restrictions1, restrictions2)).toBe(false);
    });
  });
});
