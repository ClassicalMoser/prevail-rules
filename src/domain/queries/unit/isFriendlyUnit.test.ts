import { createTestUnit } from "@testing";
import { describe, expect, it } from "vitest";
import { isFriendlyUnit } from "./isFriendlyUnit";

/**
 * isFriendlyUnit: true when the unit's playerSide matches the queried side.
 */
describe("isFriendlyUnit", () => {
  it("given black unit and black side, returns true", () => {
    const unit = createTestUnit("black", { attack: 3 });
    expect(isFriendlyUnit(unit, "black")).toBe(true);
  });

  it("given black unit and white side, returns false", () => {
    const unit = createTestUnit("black", { attack: 3 });
    expect(isFriendlyUnit(unit, "white")).toBe(false);
  });

  it("given white unit and white side, returns true", () => {
    const unit = createTestUnit("white", { attack: 3 });
    expect(isFriendlyUnit(unit, "white")).toBe(true);
  });

  it("given white unit and black side, returns false", () => {
    const unit = createTestUnit("white", { attack: 3 });
    expect(isFriendlyUnit(unit, "black")).toBe(false);
  });
});
