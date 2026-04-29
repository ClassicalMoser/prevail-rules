import type { StandardBoard } from "@entities";
import type { Event } from "@events";
import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";
import { getNextEventNumber } from "./getNextEventNumber";

describe("getNextEventNumber", () => {
  it("returns 0 when the round has no events yet", () => {
    const state = createEmptyGameState();
    expect(getNextEventNumber(state)).toBe(0);
  });

  it("returns the length of the current round event stream", () => {
    const state = createEmptyGameState();
    const events: readonly Event<StandardBoard>[] = [
      {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "revealCards",
      },
      {
        eventNumber: 1,
        eventType: "gameEffect",
        effectType: "resolveInitiative",
        player: "black",
      },
    ];
    state.currentRoundState = {
      ...state.currentRoundState,
      events,
    };

    expect(getNextEventNumber(state)).toBe(2);
  });
});
