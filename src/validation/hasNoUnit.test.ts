import { hasNoUnit } from "@validation";
import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
  createTestUnit,
} from "@testing";
import { describe, expect, it } from "vitest";

describe("hasNoUnit", () => {
  it("should return true for none unit presence", () => {
    const unitPresence = createNoneUnitPresence();
    expect(hasNoUnit(unitPresence)).toBe(true);
  });

  it("should return false for single unit presence", () => {
    const unit = createTestUnit("black", { attack: 3 });
    const unitPresence = createSingleUnitPresence(unit, "north");
    expect(hasNoUnit(unitPresence)).toBe(false);
  });

  it("should return false for engaged unit presence", () => {
    const unit1 = createTestUnit("black", { attack: 3 });
    const unit2 = createTestUnit("white", { attack: 3 });
    const unitPresence = createEngagedUnitPresence(unit1, "north", unit2);
    expect(hasNoUnit(unitPresence)).toBe(false);
  });
});

