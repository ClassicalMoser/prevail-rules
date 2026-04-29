import { hasEngagedUnits } from "@entities";
import { createTestUnit } from "@testing/unitHelpers";
import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
} from "@testing/unitPresenceHelpers";
import { describe, expect, it } from "vitest";

/**
 * hasEngagedUnits: type guard — unit presence is an engagement (two units).
 */
describe("hasEngagedUnits", () => {
  it("given none unit presence, returns false", () => {
    const unitPresence = createNoneUnitPresence();
    expect(hasEngagedUnits(unitPresence)).toBe(false);
  });

  it("given single unit presence, returns false", () => {
    const unit = createTestUnit("black", { attack: 3 });
    const unitPresence = createSingleUnitPresence(unit, "north");
    expect(hasEngagedUnits(unitPresence)).toBe(false);
  });

  it("given engaged unit presence, returns true", () => {
    const unit1 = createTestUnit("black", { attack: 3 });
    const unit2 = createTestUnit("white", { attack: 3 });
    const unitPresence = createEngagedUnitPresence(unit1, "north", unit2);
    expect(hasEngagedUnits(unitPresence)).toBe(true);
  });
});
