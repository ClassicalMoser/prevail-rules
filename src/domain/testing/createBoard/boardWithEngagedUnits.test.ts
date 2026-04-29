import { createTestUnit } from "@testing/unitHelpers";
import { describe, expect, it } from "vitest";
import { createBoardWithEngagedUnits } from "./boardWithEngagedUnits";

/**
 * createBoardWithEngagedUnits: Creates a board with engaged units at a coordinate.
 */
describe("createBoardWithEngagedUnits", () => {
  it("given defaults, creates board with engaged presence at default coord", () => {
    const primary = createTestUnit("black");
    const secondary = createTestUnit("white");
    const board = createBoardWithEngagedUnits(primary, secondary);
    const space = board.board["E-5"];
    expect(space?.unitPresence.presenceType).toBe("engaged");
    if (space?.unitPresence.presenceType === "engaged") {
      expect(space.unitPresence.primaryUnit).toBe(primary);
      expect(space.unitPresence.secondaryUnit).toBe(secondary);
    }
  });
});
