import { createTestUnit } from "src/testing/unitHelpers.js";
import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
} from "src/testing/unitPresenceHelpers.js";
import { describe, expect, it } from "vitest";
import { hasEngagedUnits } from "./hasEngagedUnits.js";

describe("hasEngagedUnits", () => {
  it("should return false for none unit presence", () => {
    const unitPresence = createNoneUnitPresence();
    expect(hasEngagedUnits(unitPresence)).toBe(false);
  });

  it("should return false for single unit presence", () => {
    const unit = createTestUnit("black", { attack: 3 });
    const unitPresence = createSingleUnitPresence(unit, "north");
    expect(hasEngagedUnits(unitPresence)).toBe(false);
  });

  it("should return true for engaged unit presence", () => {
    const unit1 = createTestUnit("black", { attack: 3 });
    const unit2 = createTestUnit("white", { attack: 3 });
    const unitPresence = createEngagedUnitPresence(unit1, "north", unit2);
    expect(hasEngagedUnits(unitPresence)).toBe(true);
  });
});
