import type { BoardCoordinate, StandardBoard } from "@entities";
import type { Event } from "@events";
import type { StandardGameState } from "@game";
import { PLAYER_CHOICE_EVENT_TYPE } from "@events";
import { PLAY_CARDS_PHASE } from "@game";
import { createEmptyGameState, createResolveMeleePhaseState } from "@testing";
import { updatePhaseState, updateRoundEventStream } from "@transforms";
import { isValidChooseMeleeResolutionEvent } from "@validation";
import { describe, expect, it } from "vitest";
import { getLegalChooseMeleeResolutionEvents } from "./getLegalChooseMeleeResolutionEvents";

/**
 * getLegalChooseMeleeResolutionEvents: initiative player’s legal choose-engagement payloads
 * during resolveMelee / resolveMelee (no melee slice in progress).
 */
describe("getLegalChooseMeleeResolutionEvents", () => {
  function stateChoosingMeleeEngagement(options?: {
    initiative?: "black" | "white";
    remaining?: Iterable<BoardCoordinate<StandardBoard>>;
    eventStream?: readonly Event<StandardBoard>[];
  }): StandardGameState {
    const base = createEmptyGameState({
      currentInitiative: options?.initiative ?? "black",
    });
    const remaining: Set<BoardCoordinate<StandardBoard>> = new Set(
      options?.remaining ?? (["E-5", "E-6"] as readonly BoardCoordinate<StandardBoard>[]),
    );
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: undefined,
      remainingEngagements: remaining,
    });
    let state = updatePhaseState(base, phase);
    if (options?.eventStream) {
      state = updateRoundEventStream(state, options.eventStream);
    }
    return state;
  }

  it("returns one full ChooseMeleeResolutionEvent per remaining engagement for initiative player", () => {
    const state = stateChoosingMeleeEngagement({
      initiative: "white",
      remaining: ["E-4", "E-5", "E-6"] as const,
    });

    const options = getLegalChooseMeleeResolutionEvents(state);

    expect(options).toHaveLength(3);
    expect(options.map((o) => o.space)).toEqual(["E-4", "E-5", "E-6"]);
    for (const o of options) {
      expect(o).toEqual({
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        choiceType: "chooseMeleeResolution",
        boardType: "standard",
        eventNumber: 0,
        player: "white",
        space: o.space,
      });
      expect(isValidChooseMeleeResolutionEvent(o, state).result).toBe(true);
    }
  });

  it("throws when there are no remaining engagements (caller should advance phase)", () => {
    const state = stateChoosingMeleeEngagement({ remaining: [] });

    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      "No legal choose melee resolution events",
    );
  });

  it("uses getNextEventNumber for eventNumber on each option", () => {
    const prior: readonly Event<StandardBoard>[] = [
      {
        eventNumber: 0,
        eventType: "gameEffect",
        effectType: "revealCards",
      },
      {
        eventNumber: 1,
        eventType: "gameEffect",
        effectType: "revealCards",
      },
    ];
    const state = stateChoosingMeleeEngagement({
      remaining: ["E-5"] as const,
      eventStream: prior,
    });

    const options = getLegalChooseMeleeResolutionEvents(state);

    expect(options).toHaveLength(1);
    expect(options[0]!.eventNumber).toBe(2);
  });

  it("throws when there is no current phase state", () => {
    const state = createEmptyGameState();
    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      "No current phase state found",
    );
  });

  it("throws when not in resolveMelee phase", () => {
    const state = updatePhaseState(createEmptyGameState(), {
      phase: PLAY_CARDS_PHASE,
      step: "chooseCards",
    });
    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow(
      "Expected resolveMelee phase, got playCards",
    );
  });

  it("throws when resolveMelee phase is not on the resolveMelee step", () => {
    const base = createEmptyGameState();
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: undefined,
      remainingEngagements: new Set<BoardCoordinate<StandardBoard>>(["E-5"]),
      step: "complete",
    });
    const state = updatePhaseState(base, phase);

    expect(() => getLegalChooseMeleeResolutionEvents(state)).toThrow("Not in resolve melee phase");
  });
});
