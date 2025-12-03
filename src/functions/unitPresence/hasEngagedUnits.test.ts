import { hasEngagedUnits } from "@functions/unitPresence/hasEngagedUnits";
import { createTestUnit } from "@testing/unitHelpers";
import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
} from "@testing/unitPresenceHelpers";
import { describe, expect, it } from "vitest";

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
