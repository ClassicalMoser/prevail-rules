import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";
import { getCurrentInitiative } from "./getCurrentInitiative";

describe("getCurrentInitiative", () => {
  it("returns the value on game state (same as reading currentInitiative)", () => {
    const state = createEmptyGameState({ currentInitiative: "white" });

    expect(getCurrentInitiative(state)).toBe("white");
    expect(getCurrentInitiative(state)).toBe(state.currentInitiative);
  });

  it("reflects initiative updates on the state object", () => {
    const state = createEmptyGameState({ currentInitiative: "black" });
    state.currentInitiative = "white";

    expect(getCurrentInitiative(state)).toBe("white");
  });
});
