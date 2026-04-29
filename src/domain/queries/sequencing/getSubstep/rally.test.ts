import type { RallyResolutionState } from "@game";
import { createCleanupPhaseState, createEmptyGameState, createTestUnit } from "@testing";
import { describe, expect, it } from "vitest";
import {
  getCurrentRallyResolutionState,
  getRallyResolutionState,
  getRoutStateFromCleanupPhaseForResolveRout,
  getRoutStateFromRally,
} from "./rally";

/**
 * Cleanup rally helpers: map player or current resolve-rally step to the right rally slice,
 * and unwrap nested rout state for rally-driven rout effects.
 */
describe("getRallyResolutionState", () => {
  it("given black is first player at chooseRally, getRallyState(black) returns first bucket", () => {
    const state = createEmptyGameState({ currentInitiative: "black" });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "firstPlayerChooseRally",
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    });

    const result = getRallyResolutionState(state, "black");
    expect(result.playerRallied).toBe(true);
  });

  it("given white is second player with second bucket set, getRallyState(white) returns it", () => {
    const state = createEmptyGameState({ currentInitiative: "black" });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "firstPlayerChooseRally",
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        playerRallied: false,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
    });

    const result = getRallyResolutionState(state, "white");
    expect(result.playerRallied).toBe(false);
  });

  it("given both rally buckets undefined at chooseRally, getRallyState(black) throws", () => {
    const state = createEmptyGameState({ currentInitiative: "black" });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "firstPlayerChooseRally",
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    });

    expect(() => getRallyResolutionState(state, "black")).toThrow(
      "No black rally resolution state found",
    );
  });
});

describe("getCurrentRallyResolutionState", () => {
  it("given step firstPlayerResolveRally with first bucket, returns that rally slice", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "firstPlayerResolveRally",
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    });

    const result = getCurrentRallyResolutionState(state);
    expect(result.playerRallied).toBe(true);
  });

  it("given firstPlayerResolveRally but first bucket missing, throws", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "firstPlayerResolveRally",
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    });

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      "No first player rally resolution state found",
    );
  });

  it("given secondPlayerResolveRally with second bucket, returns that slice", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "secondPlayerResolveRally",
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
    });

    const result = getCurrentRallyResolutionState(state);
    expect(result.playerRallied).toBe(true);
  });

  it("given secondPlayerResolveRally but second bucket missing, throws", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "secondPlayerResolveRally",
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    });

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      "No second player rally resolution state found",
    );
  });

  it("given cleanup discardPlayedCards step, getCurrentRally throws not resolveRally step", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "discardPlayedCards",
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    });

    expect(() => getCurrentRallyResolutionState(state)).toThrow("Not in a resolveRally step");
  });
});

describe("getRoutStateFromRally", () => {
  it("given rally slice with rout nested, returns that rout object", () => {
    const unit = createTestUnit("black", { attack: 2 });
    const rallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: {
        substepType: "rout" as const,
        player: "black" as const,
        unitsToRout: new Set([unit]),
        numberToDiscard: 1,
        cardsChosen: false,
        completed: false,
      },
      completed: false,
    };

    const result = getRoutStateFromRally(rallyState);
    expect(result.substepType).toBe("rout");
    expect(result.player).toBe("black");
  });

  it("given rally slice without routState, throws no rout in rally resolution", () => {
    const rallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
      completed: false,
    };

    expect(() => getRoutStateFromRally(rallyState)).toThrow(
      "No rout state found in rally resolution state",
    );
  });
});

describe("getRoutStateFromCleanupPhaseForResolveRout", () => {
  it("returns rout from first player rally on firstPlayerResolveRally", () => {
    const unit = createTestUnit("white", { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "firstPlayerResolveRally",
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: true,
        unitsLostSupport: new Set(),
        routState: {
          substepType: "rout",
          player: "white",
          unitsToRout: new Set([unit]),
          numberToDiscard: undefined,
          cardsChosen: false,
          completed: false,
        },
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    });

    const rout = getRoutStateFromCleanupPhaseForResolveRout(state);
    expect(rout.unitsToRout.has(unit)).toBe(true);
  });

  it("returns rout from second player rally on secondPlayerResolveRally", () => {
    const unit = createTestUnit("black", { attack: 2 });
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "secondPlayerResolveRally",
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: true,
        unitsLostSupport: new Set(),
        routState: {
          substepType: "rout",
          player: "black",
          unitsToRout: new Set([unit]),
          numberToDiscard: undefined,
          cardsChosen: false,
          completed: false,
        },
        completed: false,
      },
    });

    const rout = getRoutStateFromCleanupPhaseForResolveRout(state);
    expect(rout.unitsToRout.has(unit)).toBe(true);
  });

  it("throws when rally bucket has no rout state", () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: "firstPlayerResolveRally",
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: true,
        unitsLostSupport: new Set(),
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    });

    expect(() => getRoutStateFromCleanupPhaseForResolveRout(state)).toThrow(
      "No rout state found in rally resolution",
    );
  });
});
