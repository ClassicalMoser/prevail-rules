import { tempUnits } from "@sampleValues";
import { describe, expect, it } from "vitest";
import { createTestUnit, createTestUnits, createUnitByStat } from "./unitHelpers";

/**
 * createTestUnit: Creates a unit instance for testing with sensible defaults.
 */
describe("createTestUnit", () => {
  it("given no options, creates unit with default attack 3", () => {
    const unit = createTestUnit("black");
    expect(unit.playerSide).toBe("black");
    expect(unit.instanceNumber).toBe(1);
    expect(unit.unitType.stats.attack).toBe(3);
  });

  it("given use custom instance number", () => {
    const unit = createTestUnit("white", { instanceNumber: 5 });
    expect(unit.instanceNumber).toBe(5);
  });

  it("given provided, creates unit from unitType", () => {
    const unitType = tempUnits[0];
    const unit = createTestUnit("black", { unitType });
    expect(unit.unitType).toBe(unitType);
    expect(unit.playerSide).toBe("black");
  });

  it("given defaults, creates unit by stat value", () => {
    const unit = createTestUnit("white", { attack: 2 });
    expect(unit.unitType.stats.attack).toBe(2);
  });

  it("given when no unit matches specified stats, throws", () => {
    expect(() => createTestUnit("black", { attack: 999 })).toThrow(
      "No unit found matching all specified stats: attack=999.",
    );
  });

  it("given defaults, creates unit by multiple stat values including range", () => {
    const unit = createTestUnit("black", { attack: 2, range: 1 });
    expect(unit.unitType.stats.attack).toBe(2);
    expect(unit.unitType.stats.range).toBe(1);
  });
});

describe("createUnitByStat", () => {
  it("given defaults, creates unit by stat and value", () => {
    const unit = createUnitByStat("black", "attack", 3);
    expect(unit.playerSide).toBe("black");
    expect(unit.unitType.stats.attack).toBe(3);
    expect(unit.instanceNumber).toBe(1);
  });

  it("given use custom instance number", () => {
    const unit = createUnitByStat("white", "flexibility", 1, 2);
    expect(unit.instanceNumber).toBe(2);
  });

  it("given when no unit has stat value, throws", () => {
    expect(() => createUnitByStat("black", "attack", 999)).toThrow(
      "No unit found with attack value 999.",
    );
  });
});

describe("createTestUnits", () => {
  it("given defaults, creates multiple units with sequential instance numbers", () => {
    const units = createTestUnits("black", 3);
    expect(units).toHaveLength(3);
    expect(units[0].instanceNumber).toBe(1);
    expect(units[1].instanceNumber).toBe(2);
    expect(units[2].instanceNumber).toBe(3);
  });

  it("given pass options to each unit", () => {
    const units = createTestUnits("white", 2, { attack: 3 });
    expect(units[0].unitType.stats.attack).toBe(3);
    expect(units[1].unitType.stats.attack).toBe(3);
  });
});
