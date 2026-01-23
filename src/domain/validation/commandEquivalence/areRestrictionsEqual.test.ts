import type { Restrictions } from '@entities';
import { describe, expect, it } from 'vitest';
import { areRestrictionsEqual } from './areRestrictionsEqual';

describe('areRestrictionsEqual', () => {
  it('should return true when both restrictions have identical properties', () => {
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
    const { result } = areRestrictionsEqual(restrictions1, restrictions2);
    expect(result).toBe(true);
  });

  it('should return true when comparing restrictions to itself', () => {
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 2,
      traitRestrictions: ['sword'],
      unitRestrictions: ['unit-id-1'],
    };
    const { result } = areRestrictionsEqual(restrictions, restrictions);
    expect(result).toBe(true);
  });

  it('should return true for different object references with same values', () => {
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
    const { result } = areRestrictionsEqual(restrictions1, restrictions2);
    expect(result).toBe(true);
  });

  describe('inspirationRangeRestriction differences', () => {
    it('should return false when inspirationRangeRestriction differs', () => {
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
      const validationResult = areRestrictionsEqual(
        restrictions1,
        restrictions2,
      );
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain(
          'inspirationRangeRestriction',
        );
      }
    });

    it('should return false when one is undefined and the other is not', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: undefined,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(false);
    });

    it('should return true when both are undefined', () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: undefined,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: undefined,
        traitRestrictions: [],
        unitRestrictions: [],
      };
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(true);
    });
  });

  describe('traitRestrictions differences', () => {
    it('should return false when traitRestrictions arrays have different lengths', () => {
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
      const validationResult = areRestrictionsEqual(
        restrictions1,
        restrictions2,
      );
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain(
          'traitRestrictions array lengths',
        );
      }
    });

    it('should return false when traitRestrictions differ at an index', () => {
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
      const validationResult = areRestrictionsEqual(
        restrictions1,
        restrictions2,
      );
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain(
          'traitRestrictions at index',
        );
      }
    });

    it('should return true when traitRestrictions arrays match', () => {
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
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(true);
    });

    it('should return false when traitRestrictions have same elements but different order', () => {
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
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(false);
    });
  });

  describe('unitRestrictions differences', () => {
    it('should return false when unitRestrictions arrays have different lengths', () => {
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
      const validationResult = areRestrictionsEqual(
        restrictions1,
        restrictions2,
      );
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain(
          'unitRestrictions array lengths',
        );
      }
    });

    it('should return false when unitRestrictions differ at an index', () => {
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
      const validationResult = areRestrictionsEqual(
        restrictions1,
        restrictions2,
      );
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain(
          'unitRestrictions at index',
        );
      }
    });

    it('should return true when unitRestrictions arrays match', () => {
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
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(true);
    });

    it('should return false when unitRestrictions have same elements but different order', () => {
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
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(false);
    });
  });

  it('should return false when comparing restrictions to undefined', () => {
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    };
    // Intentional type error to test the function
    const { result } = areRestrictionsEqual(
      restrictions,
      undefined as unknown as Restrictions,
    );
    expect(result).toBe(false);
  });
});
