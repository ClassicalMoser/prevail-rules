import { areSameSide } from "@entities";
import { createTestUnit } from "@testing/unitHelpers";
import { describe, expect, it } from "vitest";

/**
 * areSameSide: checks whether two units belong to the same player side (type-guard overloads for narrowing).
 */
describe("areSameSide", () => {
  it("given both units belong to the same side, returns true", () => {
    const unit1 = createTestUnit("black", { attack: 3 });
    const unit2 = createTestUnit("black", { attack: 4 });
    expect(areSameSide(unit1, unit2)).toBe(true);
  });

  it("given units belong to different sides, returns false", () => {
    const unit1 = createTestUnit("black", { attack: 3 });
    const unit2 = createTestUnit("white", { attack: 3 });
    expect(areSameSide(unit1, unit2)).toBe(false);
  });

  it("given white units on the same side, returns true", () => {
    const unit1 = createTestUnit("white", { attack: 3 });
    const unit2 = createTestUnit("white", { attack: 4 });
    expect(areSameSide(unit1, unit2)).toBe(true);
  });

  it("given comparing a unit to itself, returns true", () => {
    const unit = createTestUnit("black", { attack: 3 });
    expect(areSameSide(unit, unit)).toBe(true);
  });
});
