import { hasSingleUnit } from "@validation";
import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
  createTestUnit,
} from "@testing";
import { describe, expect, it } from "vitest";

describe("hasSingleUnit", () => {
  it("should return false for none unit presence", () => {
    const unitPresence = createNoneUnitPresence();
    expect(hasSingleUnit(unitPresence)).toBe(false);
  });

  it("should return true for single unit presence", () => {
    const unit = createTestUnit("black", { attack: 3 });
    const unitPresence = createSingleUnitPresence(unit, "north");
    expect(hasSingleUnit(unitPresence)).toBe(true);
  });

  it("should return false for engaged unit presence", () => {
    const unit1 = createTestUnit("black", { attack: 3 });
    const unit2 = createTestUnit("white", { attack: 3 });
    const unitPresence = createEngagedUnitPresence(unit1, "north", unit2);
    expect(hasSingleUnit(unitPresence)).toBe(false);
  });
});

