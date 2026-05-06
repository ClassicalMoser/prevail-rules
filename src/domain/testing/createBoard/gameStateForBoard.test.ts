import { getPlayerUnitWithPosition } from "@queries";
import { createTestUnit } from "@testing/unitHelpers";
import { describe, expect, it } from "vitest";
import {
  createGameStateWithEngagedUnits,
  createGameStateWithSingleUnit,
  createGameStateWithUnits,
} from "./gameStateForBoard";

/**
 * createGameStateWithSingleUnit: Creates a game state with a single unit at a coordinate.
 */
describe("createGameStateWithSingleUnit", () => {
  it("given context, returns game state with single unit on board", () => {
    const state = createGameStateWithSingleUnit("E-5", "black");
    expect(state.boardState.boardType).toBe("standard");
    expect(getPlayerUnitWithPosition(state.boardState, "E-5", "black")).toBeDefined();
  });
});

describe("createGameStateWithEngagedUnits", () => {
  it("given context, returns game state with engaged units", () => {
    const primary = createTestUnit("black");
    const secondary = createTestUnit("white");
    const state = createGameStateWithEngagedUnits(primary, secondary);
    expect(state.boardState.board["E-5"]?.unitPresence.presenceType).toBe("engaged");
  });
});

describe("createGameStateWithUnits", () => {
  it("given context, returns game state with multiple units", () => {
    const unit1 = createTestUnit("black");
    const unit2 = createTestUnit("white");
    const state = createGameStateWithUnits([
      { unit: unit1, coordinate: "E-5", facing: "north" },
      { unit: unit2, coordinate: "E-6", facing: "south" },
    ]);
    expect(getPlayerUnitWithPosition(state.boardState, "E-5", "black")).toBeDefined();
    expect(getPlayerUnitWithPosition(state.boardState, "E-6", "white")).toBeDefined();
  });
});
