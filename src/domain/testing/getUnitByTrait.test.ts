import type { Trait } from "@ruleValues";
import { describe, expect, it } from "vitest";
import { getUnitByTrait } from "./getUnitByTrait";

/**
 * getUnitByTrait: Finds a unit type by matching one or more traits.
 */
describe("getUnitByTrait", () => {
  it("given context, returns unit type with single trait", () => {
    const unitType = getUnitByTrait("formation");
    expect(unitType).toBeDefined();
    expect(unitType.traits).toContain("formation");
  });

  it("given context, returns unit type with all given traits", () => {
    const unitType = getUnitByTrait("formation", "phalanx");
    expect(unitType).toBeDefined();
    expect(unitType.traits).toContain("formation");
    expect(unitType.traits).toContain("phalanx");
  });

  it("given when no unit has the trait, throws", () => {
    // Use bad cast to trigger type error
    expect(() => getUnitByTrait("nonexistent" as Trait)).toThrow(
      'No unit found with trait "nonexistent".',
    );
  });

  it("given when no unit has all traits, throws", () => {
    // Use bad cast to trigger type error
    expect(() => getUnitByTrait("formation", "nonexistent" as Trait)).toThrow(
      'No unit found with traits ["formation", "nonexistent"].',
    );
  });
});
