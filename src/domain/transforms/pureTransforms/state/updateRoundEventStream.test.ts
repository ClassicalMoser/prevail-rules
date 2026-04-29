import type { StandardBoard } from "@entities";
import type { Event } from "@events";
import { createEmptyGameState } from "@testing";
import { describe, expect, it } from "vitest";
import { updateRoundEventStream } from "./updateRoundEventStream";

describe("updateRoundEventStream", () => {
  it("sets currentRoundState.events to the given stream", () => {
    const state = createEmptyGameState();
    const events: readonly Event<StandardBoard>[] = [
      {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "revealCards",
      },
    ];

    const next = updateRoundEventStream(state, events);

    expect(next.currentRoundState.events).toBe(events);
    expect(state.currentRoundState.events).toEqual([]);
  });

  it("does not mutate the original state", () => {
    const state = createEmptyGameState();
    updateRoundEventStream(state, []);

    expect(state.currentRoundState.events).toEqual([]);
  });
});
