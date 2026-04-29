import { tempCommandCards } from "@sampleValues";
import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";
import { updateCardState } from "./updateCardState";

/**
 * updateCardState: Creates a new game state with the card state updated.
 */
describe("updateCardState", () => {
  it("given update card state with object", () => {
    const state = createEmptyGameState();
    const newCardState = {
      ...state.cardState,
      black: {
        ...state.cardState.black,
        inHand: [tempCommandCards[0]],
      },
    };

    const newState = updateCardState(state, newCardState);

    expect(newState.cardState.black.inHand).toEqual([tempCommandCards[0]]);
    expect(newState.cardState.white).toBe(state.cardState.white);
  });

  it("given update card state with function", () => {
    const state = createEmptyGameState();

    const newState = updateCardState(state, (current) => ({
      ...current,
      black: {
        ...current.black,
        inHand: [tempCommandCards[0]],
      },
    }));

    expect(newState.cardState.black.inHand).toEqual([tempCommandCards[0]]);
  });

  it("given not mutate the original state", () => {
    const state = createEmptyGameState();
    const originalCardState = state.cardState;

    updateCardState(state, (current) => ({
      ...current,
      black: { ...current.black, inHand: [tempCommandCards[0]] },
    }));

    expect(state.cardState).toBe(originalCardState);
    expect(state.cardState.black.inHand).not.toContain(tempCommandCards[0]);
  });
});
