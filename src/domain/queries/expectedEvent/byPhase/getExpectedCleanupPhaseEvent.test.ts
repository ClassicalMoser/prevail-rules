import type { CleanupPhaseStep } from "@game";
import { GameState } from "@game";
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createRallyResolutionState,
} from "@testing";
import { describe, expect, it } from "vitest";
import { getExpectedCleanupPhaseEvent } from "./getExpectedCleanupPhaseEvent";

/**
 * getExpectedCleanupPhaseEvent: next cleanup-phase event from cleanup step and rally state.
 */
describe("getExpectedCleanupPhaseEvent", () => {
  function createGameStateInCleanupStep(
    step: CleanupPhaseStep,
    currentInitiative: "black" | "white" = "black",
  ): GameState {
    const state = createEmptyGameState({ currentInitiative });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step,
      firstPlayerRallyResolutionState: createRallyResolutionState({
        completed: false,
      }),
      secondPlayerRallyResolutionState: createRallyResolutionState({
        completed: false,
      }),
    });
    return state;
  }

  it("given context, returns discardPlayedCards game effect", () => {
    const state = createGameStateInCleanupStep("discardPlayedCards");

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe("gameEffect");
    expect(expectedEvent.actionType === "gameEffect" && expectedEvent.effectType).toBe(
      "discardPlayedCards",
    );
  });

  it("given context, returns first player choose rally", () => {
    const state = createGameStateInCleanupStep("firstPlayerChooseRally", "white");

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe("playerChoice");
    expect(expectedEvent.actionType === "playerChoice" && expectedEvent.playerSource).toBe("white");
    expect(expectedEvent.actionType === "playerChoice" && expectedEvent.choiceType).toBe(
      "chooseRally",
    );
  });

  it("given context, returns second player choose rally", () => {
    const state = createGameStateInCleanupStep("secondPlayerChooseRally", "white");

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe("playerChoice");
    expect(expectedEvent.actionType === "playerChoice" && expectedEvent.playerSource).toBe("black");
    expect(expectedEvent.actionType === "playerChoice" && expectedEvent.choiceType).toBe(
      "chooseRally",
    );
  });

  it("given first player rally resolution, returns resolveRally game effect", () => {
    const state = createGameStateInCleanupStep("firstPlayerResolveRally");

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe("gameEffect");
    expect(expectedEvent.actionType === "gameEffect" && expectedEvent.effectType).toBe(
      "resolveRally",
    );
  });

  it("given when first player rally resolution state is missing, throws", () => {
    const state = createGameStateInCleanupStep("firstPlayerResolveRally");
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState?.phase === "cleanup") {
      phaseState.firstPlayerRallyResolutionState = undefined;
    }

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      "First player rally resolution state not found",
    );
  });

  it("given second player rally resolution, returns resolveRally game effect", () => {
    const state = createGameStateInCleanupStep("secondPlayerResolveRally");

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe("gameEffect");
    expect(expectedEvent.actionType === "gameEffect" && expectedEvent.effectType).toBe(
      "resolveRally",
    );
  });

  it("given when second player rally resolution state is missing, throws", () => {
    const state = createGameStateInCleanupStep("secondPlayerResolveRally");
    const phaseState = state.currentRoundState.currentPhaseState;
    if (phaseState?.phase === "cleanup") {
      phaseState.secondPlayerRallyResolutionState = undefined;
    }

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      "Second player rally resolution state not found",
    );
  });

  it("given context, returns completeCleanupPhase game effect", () => {
    const state = createGameStateInCleanupStep("complete");

    const expectedEvent = getExpectedCleanupPhaseEvent(state);

    expect(expectedEvent.actionType).toBe("gameEffect");
    expect(expectedEvent.actionType === "gameEffect" && expectedEvent.effectType).toBe(
      "completeCleanupPhase",
    );
  });

  it("given for invalid step, throws", () => {
    const state = createGameStateInCleanupStep("discardPlayedCards");
    // Force an invalid cleanup step to hit the default branch.
    state.currentRoundState.currentPhaseState = {
      ...state.currentRoundState.currentPhaseState,
      step: "invalidStep",
    } as any; // Bad type cast to test default case

    expect(() => getExpectedCleanupPhaseEvent(state)).toThrow(
      "Invalid cleanup phase step: invalidStep",
    );
  });
});
