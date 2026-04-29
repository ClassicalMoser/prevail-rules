import type { StandardBoard } from "@entities";
import type { Event } from "@events";
import type { StandardGameState } from "@game";
import { PLAYER_CHOICE_EVENT_TYPE } from "@events";
import { PLAY_CARDS_PHASE } from "@game";
import { createCleanupPhaseState, createEmptyGameState } from "@testing";
import { updatePhaseState, updateRoundEventStream } from "@transforms";
import { describe, expect, it } from "vitest";
import { getLegalChooseRallyEvent } from "./getLegalChooseRallyEvent";

const chooseRallyBase = {
  eventType: PLAYER_CHOICE_EVENT_TYPE,
  choiceType: "chooseRally" as const,
};

/**
 * getLegalChooseRallyEvent: both performRally choices for whichever player may choose
 * during cleanup firstPlayerChooseRally / secondPlayerChooseRally.
 */
describe("getLegalChooseRallyEvent", () => {
  function stateChooseRally(options: {
    step: "firstPlayerChooseRally" | "secondPlayerChooseRally";
    initiative?: "black" | "white";
    eventStream?: readonly Event<StandardBoard>[];
  }): StandardGameState {
    const base = createEmptyGameState({
      currentInitiative: options.initiative ?? "black",
    });
    const phase = createCleanupPhaseState({ step: options.step });
    let state = updatePhaseState(base, phase);
    if (options.eventStream) {
      state = updateRoundEventStream(state, options.eventStream);
    }
    return state;
  }

  it("firstPlayerChooseRally: returns true/false for initiative player", () => {
    const state = stateChooseRally({
      step: "firstPlayerChooseRally",
      initiative: "white",
    });

    expect(getLegalChooseRallyEvent(state)).toEqual([
      {
        ...chooseRallyBase,
        eventNumber: 0,
        player: "white",
        performRally: true,
      },
      {
        ...chooseRallyBase,
        eventNumber: 0,
        player: "white",
        performRally: false,
      },
    ]);
  });

  it("secondPlayerChooseRally: returns true/false for the other player", () => {
    const state = stateChooseRally({
      step: "secondPlayerChooseRally",
      initiative: "black",
    });

    expect(getLegalChooseRallyEvent(state)).toEqual([
      {
        ...chooseRallyBase,
        eventNumber: 0,
        player: "white",
        performRally: true,
      },
      {
        ...chooseRallyBase,
        eventNumber: 0,
        player: "white",
        performRally: false,
      },
    ]);
  });

  it("uses getNextEventNumber for eventNumber", () => {
    const prior: readonly Event<StandardBoard>[] = [
      {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "revealCards",
      },
    ];
    const state = stateChooseRally({
      step: "firstPlayerChooseRally",
      eventStream: prior,
    });

    const options = getLegalChooseRallyEvent(state);

    expect(options).toHaveLength(2);
    expect(options[0]!.eventNumber).toBe(1);
    expect(options[1]!.eventNumber).toBe(1);
  });

  it("throws when cleanup step is not a choose-rally step", () => {
    const state = updatePhaseState(
      createEmptyGameState(),
      createCleanupPhaseState({ step: "discardPlayedCards" }),
    );

    expect(() => getLegalChooseRallyEvent(state)).toThrow("Not in choose rally step");
  });

  it("throws when not in cleanup phase", () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: "chooseCards",
    });

    expect(() => getLegalChooseRallyEvent(state)).toThrow("Expected cleanup phase, got playCards");
  });
});
