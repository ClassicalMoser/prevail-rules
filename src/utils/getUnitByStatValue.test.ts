import { describe, expect, it } from "vitest";
import { getUnitByStatValue } from "./getUnitByStatValue.js";

describe("getUnitByStatValue", () => {
  it("should return a unit when found by attack value", () => {
    const unit = getUnitByStatValue("attack", 3);
    expect(unit).toBeDefined();
    expect(unit?.attack).toBe(3);
  });

  it("should return a unit when found by speed value", () => {
    const unit = getUnitByStatValue("speed", 2);
    expect(unit).toBeDefined();
    expect(unit?.speed).toBe(2);
  });

  it("should return a unit when found by flexibility value", () => {
    const unit = getUnitByStatValue("flexibility", 1);
    expect(unit).toBeDefined();
    expect(unit?.flexibility).toBe(1);
  });

  it("should throw an error when no unit is found with the specified stat value", () => {
    // Test coverage for lines 14-15: error case when no unit matches the stat value
    // This tests the error handling when tempUnits.find returns undefined
    expect(() => getUnitByStatValue("attack", 999)).toThrow(
      new Error("No unit found with attack value 999.")
    );
  });

  it("should throw an error with correct message format for different stats", () => {
    // Test coverage for lines 14-15: ensure error message includes the stat name and value
    expect(() => getUnitByStatValue("speed", 999)).toThrow(
      new Error("No unit found with speed value 999.")
    );
    expect(() => getUnitByStatValue("flexibility", 999)).toThrow(
      new Error("No unit found with flexibility value 999.")
    );
  });
});
