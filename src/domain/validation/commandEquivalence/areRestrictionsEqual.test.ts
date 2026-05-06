import type { Restrictions } from "@entities";
import { describe, expect, it } from "vitest";
import { areRestrictionsEqual } from "./areRestrictionsEqual";

/**
 * areRestrictionsEqual: Compares two Restrictions objects for equality by comparing all properties.
 */
describe("areRestrictionsEqual", () => {
  it("given both restrictions have identical properties, returns true", () => {
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

  it("given comparing restrictions to itself, returns true", () => {
    const restrictions: Restrictions = {
      inspirationRangeRestriction: 2,
      traitRestrictions: ["sword"],
      unitRestrictions: ["unit-id-1"],
    };
    const { result } = areRestrictionsEqual(restrictions, restrictions);
    expect(result).toBe(true);
  });

  it("given different object references with same values, returns true", () => {
    const restrictions1: Restrictions = {
      inspirationRangeRestriction: 3,
      traitRestrictions: ["skirmish"],
      unitRestrictions: ["unit-id-2"],
    };
    const restrictions2: Restrictions = {
      inspirationRangeRestriction: 3,
      traitRestrictions: ["skirmish"],
      unitRestrictions: ["unit-id-2"],
    };
    const { result } = areRestrictionsEqual(restrictions1, restrictions2);
    expect(result).toBe(true);
  });

  describe("inspirationRangeRestriction differences", () => {
    it("given inspirationRangeRestriction differs, returns false", () => {
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
      const validationResult = areRestrictionsEqual(restrictions1, restrictions2);
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain("inspirationRangeRestriction");
      }
    });

    it("given one is undefined and the other is not, returns false", () => {
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

    it("given both are undefined, returns true", () => {
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

  describe("traitRestrictions differences", () => {
    it("given traitRestrictions arrays have different lengths, returns false", () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["sword"],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["sword", "skirmish"],
        unitRestrictions: [],
      };
      const validationResult = areRestrictionsEqual(restrictions1, restrictions2);
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain("traitRestrictions array lengths");
      }
    });

    it("given traitRestrictions differ at an index, returns false", () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["sword"],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["skirmish"],
        unitRestrictions: [],
      };
      const validationResult = areRestrictionsEqual(restrictions1, restrictions2);
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain("traitRestrictions at index");
      }
    });

    it("given traitRestrictions arrays match, returns true", () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["sword", "skirmish"],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["sword", "skirmish"],
        unitRestrictions: [],
      };
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(true);
    });

    it("given traitRestrictions have same elements but different order, returns false", () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["sword", "skirmish"],
        unitRestrictions: [],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: ["skirmish", "sword"],
        unitRestrictions: [],
      };
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(false);
    });
  });

  describe("unitRestrictions differences", () => {
    it("given unitRestrictions arrays have different lengths, returns false", () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ["unit-id-1"],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ["unit-id-1", "unit-id-2"],
      };
      const validationResult = areRestrictionsEqual(restrictions1, restrictions2);
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain("unitRestrictions array lengths");
      }
    });

    it("given unitRestrictions differ at an index, returns false", () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ["unit-id-1"],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ["unit-id-2"],
      };
      const validationResult = areRestrictionsEqual(restrictions1, restrictions2);
      expect(validationResult.result).toBe(false);
      if (!validationResult.result) {
        expect(validationResult.errorReason).toContain("unitRestrictions at index");
      }
    });

    it("given unitRestrictions arrays match, returns true", () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ["unit-id-1", "unit-id-2"],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ["unit-id-1", "unit-id-2"],
      };
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(true);
    });

    it("given unitRestrictions have same elements but different order, returns false", () => {
      const restrictions1: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ["unit-id-1", "unit-id-2"],
      };
      const restrictions2: Restrictions = {
        inspirationRangeRestriction: 1,
        traitRestrictions: [],
        unitRestrictions: ["unit-id-2", "unit-id-1"],
      };
      const { result } = areRestrictionsEqual(restrictions1, restrictions2);
      expect(result).toBe(false);
    });
  });
});
