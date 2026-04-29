import { describe, expect, it } from "vitest";
import { createUnitWithPlacement } from "./unitWithPlacement";

/**
 * createUnitWithPlacement: Creates a UnitWithPlacement for testing with sensible defaults.
 */
describe("createUnitWithPlacement", () => {
  it("given no options, returns unit with default placement", () => {
    const result = createUnitWithPlacement();
    expect(result.placement.coordinate).toBe("E-5");
    expect(result.placement.facing).toBe("north");
    expect(result.unit.playerSide).toBe("black");
  });

  it("given use provided coordinate, facing, and playerSide", () => {
    const result = createUnitWithPlacement({
      coordinate: "D-4",
      facing: "south",
      playerSide: "white",
    });
    expect(result.placement.coordinate).toBe("D-4");
    expect(result.placement.facing).toBe("south");
    expect(result.unit.playerSide).toBe("white");
  });

  it("given pass unitOptions to createTestUnit", () => {
    const result = createUnitWithPlacement({
      playerSide: "black",
      unitOptions: { attack: 2, instanceNumber: 2 },
    });
    expect(result.unit.unitType.stats.attack).toBe(2);
    expect(result.unit.instanceNumber).toBe(2);
  });
});
