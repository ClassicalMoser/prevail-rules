import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";

import { updateCurrentInitiative } from "./updateCurrentInitiative";

/**
 * updateCurrentInitiative: Creates a new game state with the current initiative player updated.
 */
describe("updateCurrentInitiative", () => {
  it("updates the initiative player", () => {
    const state = createEmptyGameState({ currentInitiative: "white" });
    const newState = updateCurrentInitiative(state, "black");
    expect(newState.currentInitiative).toBe("black");
    expect(newState).not.toBe(state);
  });

  it("preserves other top-level fields", () => {
    const state = createEmptyGameState();
    const newState = updateCurrentInitiative(state, "white");
    expect(newState.currentRoundState).toBe(state.currentRoundState);
    expect(newState.boardState).toBe(state.boardState);
    expect(newState.cardState).toBe(state.cardState);
  });
});
